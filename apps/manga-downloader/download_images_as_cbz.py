import argparse
import base64
import os
import shutil
import sys
import time
from pathlib import Path
from urllib.parse import unquote, urlparse

# --- 必要なインポート ---
try:
    from playwright.sync_api import (
        Browser,
        BrowserContext,
        Locator,
        Page,
        Playwright,
        sync_playwright,
    )
    from tqdm import tqdm
except ImportError as e:
    print(f"[ERROR] 必要なライブラリが見つかりません: {e}")
    print("pip install playwright tqdm を実行してください。")
    sys.exit(1)


# --- 設定・定数 ---

# ブラウザのUser-Agent設定
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)

# ターゲットサイトの構造依存定数 (サイトの仕様変更時はここを修正)
SELECTOR_PAGE_WRAPPER = ".cz"  # 各ページを包む要素のクラス
SELECTOR_CANVAS = "canvas"     # 描画対象のCanvas

# 画像保存設定
IMAGE_FORMAT = "image/jpeg"    # 'image/png' or 'image/jpeg'
IMAGE_QUALITY = 0.95           # JPEGの場合の品質 (0.0 ~ 1.0)

# タイムアウト設定 (ミリ秒)
TIMEOUT_PAGE_LOAD = 60000
TIMEOUT_ELEMENT_WAIT = 10000


def scroll_to_bottom(page: Page, step_pixels: int = 500, delay_ms: int = 200) -> None:
    """
    ページ最下部まで少しずつスクロールし、遅延読み込み画像を確実にロードさせます。
    """
    print("[INFO] 全ページをロードするためにスクロールを開始します...")

    previous_height = page.evaluate("document.body.scrollHeight")

    while True:
        page.evaluate(f"window.scrollBy(0, {step_pixels})")
        page.wait_for_timeout(delay_ms)

        # 現在のスクロール位置 + ウィンドウの高さがドキュメントの高さ以上になったか確認
        reached_bottom = page.evaluate("""() => {
            return (window.innerHeight + window.scrollY) >= document.body.offsetHeight;
        }""")

        if reached_bottom:
            # 念のため少し待って、高さが増えないか（ロードによるDOM拡張がないか）確認
            page.wait_for_timeout(1000)
            new_height = page.evaluate("document.body.scrollHeight")
            if new_height == previous_height:
                break
            previous_height = new_height


def fetch_and_save_images_from_canvas(
    p: Playwright,
    target_url: str,
    output_dir: Path
) -> bool:
    """
    Playwrightを使用してブラウザを起動し、Canvasからレンダリング済み画像を抽出して保存します。
    """
    # セキュリティ制限を無効化して起動 (Tainted Canvas回避のため必須)
    browser: Browser = p.chromium.launch(
        headless=True,
        args=[
            "--disable-web-security",
            "--disable-features=IsolateOrigins,site-per-process",
            "--disable-blink-features=AutomationControlled"
        ]
    )

    context: BrowserContext = browser.new_context(
        user_agent=USER_AGENT,
        viewport={"width": 1280, "height": 1080},
        device_scale_factor=1.0
    )

    page: Page = context.new_page()
    saved_count = 0

    # 出力ディレクトリ作成
    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        print(f"[INFO] ページにアクセス中: {target_url}")
        page.goto(target_url, timeout=TIMEOUT_PAGE_LOAD, wait_until="domcontentloaded")

        # ネットワークアイドルを少し待つ
        try:
            page.wait_for_load_state("networkidle", timeout=5000)
        except:
            print("[WARN] ネットワークアイドル待機がタイムアウトしましたが、処理を続行します。")

        # 遅延ロード対策のスクロール
        scroll_to_bottom(page)

        # ページ要素の検出
        page_elements: list[Locator] = page.locator(SELECTOR_PAGE_WRAPPER).all()
        total_pages = len(page_elements)
        print(f"[INFO] {total_pages} ページ分の要素を検出しました。")

        if total_pages == 0:
            print(f"[ERROR] ページ要素 ({SELECTOR_PAGE_WRAPPER}) が見つかりません。セレクタが変更された可能性があります。")
            # デバッグ用スクリーンショット
            try:
                debug_shot = output_dir / "debug_error.png"
                page.screenshot(path=str(debug_shot))
                print(f"[DEBUG] エラー時のスクリーンショットを保存しました: {debug_shot}")
            except:
                pass
            return False

        # 各ページを順に処理
        for i, elem in enumerate(tqdm(page_elements, desc="Canvas抽出中")):
            try:
                elem.scroll_into_view_if_needed()

                canvas = elem.locator(SELECTOR_CANVAS).first

                # Canvasの可視化待機
                try:
                    canvas.wait_for(state="visible", timeout=TIMEOUT_ELEMENT_WAIT)
                except Exception:
                    # タイムアウトした場合、少しスクロールして再試行
                    page.mouse.wheel(0, 100)
                    page.wait_for_timeout(1000)
                    if not canvas.is_visible():
                        # それでもダメならスキップ（空白ページ等の可能性）
                        continue

                page.wait_for_timeout(200) # 描画完了待ち

                # Canvasから画像データ取得
                js_code = f"el => el.toDataURL('{IMAGE_FORMAT}', {IMAGE_QUALITY})"
                data_url: str = canvas.evaluate(js_code)

                if "base64," in data_url:
                    base64_data = data_url.split("base64,")[1]
                    img_data = base64.b64decode(base64_data)

                    ext = ".jpg" if IMAGE_FORMAT == "image/jpeg" else ".png"
                    save_path = output_dir / f"{i+1:03d}{ext}"

                    with open(save_path, "wb") as f:
                        f.write(img_data)
                    saved_count += 1

            except Exception:
                continue

    except Exception as e:
        print(f"[FATAL] ブラウザ操作中にエラーが発生しました: {e}")
        return False

    finally:
        context.close()
        browser.close()

    print(f"[INFO] 画像保存完了: {saved_count}/{total_pages} 枚")
    return saved_count > 0


def create_cbz_archive(source_dir: Path, output_file: Path) -> None:
    """
    指定されたディレクトリをCBZファイルに圧縮します。
    """
    # 一時的にzipを作成
    base_name = output_file.parent / output_file.stem
    zip_path = shutil.make_archive(
        base_name=str(base_name),
        format="zip",
        root_dir=str(source_dir)
    )

    # 既存ファイルがあれば削除
    if output_file.exists():
        try:
            os.remove(output_file)
        except OSError:
            pass

    # 拡張子を .zip -> .cbz に変更して移動
    try:
        os.rename(zip_path, output_file)
        print(f"[SUCCESS] CBZファイル作成: {output_file.name}")
    except OSError as e:
        print(f"[FATAL] ファイルのリネームに失敗しました: {e}")


def determine_filename(url: str, specified_name: str | None = None) -> str:
    """
    URLと指定名からファイル名を決定します。
    """
    if specified_name:
        return specified_name if specified_name.lower().endswith(".cbz") else f"{specified_name}.cbz"

    try:
        parsed = urlparse(url)
        path_parts = [p for p in parsed.path.split("/") if p]
        if path_parts:
            # URLの最後の部分をファイル名候補にする（デコード済み）
            candidate = unquote(path_parts[-1])
            # ファイルシステムで使用できない文字を置換
            candidate = "".join(c for c in candidate if c.isalnum() or c in (' ', '.', '_', '-'))
            return f"{candidate}.cbz"
    except:
        pass

    # フォールバック
    timestamp = int(time.time())
    return f"manga_{timestamp}.cbz"


def process_url(p: Playwright, url: str, base_dir: Path, keep_temp: bool, fixed_name: str | None = None):
    """
    1つのURLに対する処理を実行します。
    """
    print("\n" + "=" * 60)
    print(f"[START] 処理開始: {url}")

    # ファイル名の決定
    cbz_name = determine_filename(url, fixed_name)
    output_cbz_path = base_dir / cbz_name

    # 一時ディレクトリ
    temp_dir_name = f"temp_{output_cbz_path.stem}"
    temp_image_dir = base_dir / temp_dir_name

    print(f"[INFO] 保存先: {output_cbz_path}")

    # 画像のダウンロード
    success = fetch_and_save_images_from_canvas(p, url, temp_image_dir)

    if success:
        # CBZ作成
        create_cbz_archive(temp_image_dir, output_cbz_path)
    else:
        print("[FAILED] 画像の保存に失敗したため、アーカイブ作成をスキップします。")

    # 後片付け
    if not keep_temp and temp_image_dir.exists():
        try:
            shutil.rmtree(temp_image_dir)
        except:
            pass


def main() -> None:
    """
    メイン実行関数
    """
    parser = argparse.ArgumentParser(description="マンガサイトからCanvas画像を抽出しCBZ形式で保存します。")
    parser.add_argument("urls", nargs="*", help="対象のマンガページのURL (スペース区切りで複数指定可)")
    parser.add_argument("--file", "-f", help="URLリストが記載されたテキストファイル")
    parser.add_argument("--name", "-n", help="出力ファイル名 (単一URL指定時のみ有効)")
    # デフォルトパスを変更
    parser.add_argument("--output-dir", "-o", help="保存先フォルダ (デフォルト: H:\\DL\\MangaDownloads)")
    parser.add_argument("--keep-temp", "-k", action="store_true", help="一時フォルダを削除せずに残す")

    args = parser.parse_args()

    # 1. ターゲットURLリストの作成
    target_urls = []

    if args.urls:
        target_urls.extend(args.urls)

    if args.file:
        file_path = Path(args.file)
        if file_path.exists():
            try:
                with open(file_path, encoding='utf-8') as f:
                    lines = [line.strip() for line in f if line.strip() and not line.startswith('#')]
                    target_urls.extend(lines)
                print(f"[INFO] ファイルから {len(lines)} 件のURLを読み込みました。")
            except Exception as e:
                print(f"[ERROR] ファイル読み込みエラー: {e}")
        else:
            print(f"[ERROR] 指定されたファイルが見つかりません: {args.file}")

    if not target_urls:
        print("--- Manga Downloader (Canvas Extractor) ---")
        input_url = input("対象のURLを入力してください: ").strip()
        if input_url:
            target_urls.append(input_url)
        else:
            print("[ERROR] URLが指定されていません。終了します。")
            return

    # 2. 保存先ディレクトリの決定
    if args.output_dir:
        base_dir = Path(args.output_dir)
    else:
        # === 変更点: デフォルト保存先を固定 ===
        base_dir = Path(r"H:\DL\MangaDownloads")

    # ディレクトリ作成 (ドライブが存在しない場合エラーになります)
    try:
        base_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print(f"[ERROR] 保存先ディレクトリ '{base_dir}' が作成できません: {e}")
        print("[HINT] Hドライブが接続されているか確認してください。")
        return

    # 3. 処理実行
    print(f"[INFO] 合計 {len(target_urls)} 件の処理を開始します。")

    fixed_name = args.name if len(target_urls) == 1 else None
    if args.name and len(target_urls) > 1:
        print("[WARN] 複数URLが指定されたため、--name オプションは無視されます。URLからファイル名を自動生成します。")

    try:
        with sync_playwright() as p:
            for i, url in enumerate(target_urls):
                print(f"\n[{i+1}/{len(target_urls)}] ----------------------------------------")
                process_url(p, url, base_dir, args.keep_temp, fixed_name)

    except KeyboardInterrupt:
        print("\n[INFO] ユーザーによって処理が中断されました。")
    except Exception as e:
        print(f"[FATAL] 予期せぬエラー: {e}")

if __name__ == "__main__":
    main()
