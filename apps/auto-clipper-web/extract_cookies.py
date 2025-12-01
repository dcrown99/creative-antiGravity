### extract_cookies.py
# 実行方法: python extract_cookies.py
import yt_dlp
import os

def extract_cookies():
    print("=== YouTube Cookie Extractor ===")
    print("ローカルブラウザからYouTubeのCookieを抽出し、cookies.txtを生成します。")
    print("対象: Chrome, Edge, Firefox\n")

    browsers = ['chrome', 'edge', 'firefox']
    output_file = 'backend/cookies.txt'
    
    # backendディレクトリがない場合に対応
    if not os.path.exists('backend'):
        output_file = 'cookies.txt'

    for browser in browsers:
        print(f"Checking {browser}...")
        opts = {
            'cookiesfrombrowser': (browser,),
            'cookiefile': output_file,
            'quiet': True,
            'skip_download': True, # 動画はダウンロードしない
        }

        try:
            # ダミーURLを使ってCookieダンプをトリガーする
            # (実際にアクセスしてセッション有効性を確認する)
            with yt_dlp.YoutubeDL(opts) as ydl:
                # YouTubeのトップページなど軽量なURLでチェック
                ydl.extract_info("https://www.youtube.com/watch?v=jNQXAC9IVRw", download=False)
                
            print(f"✅ 成功! {browser} のCookieを {output_file} に保存しました。")
            print("このファイルをサーバーの backend/cookies.txt に配置してください。")
            return
            
        except Exception as e:
            if "cookie" in str(e).lower() or "browser" in str(e).lower():
                print(f"❌ {browser} から取得できませんでした (ブラウザが開いている場合は閉じて再試行してください)")
            else:
                # 成功しても動画情報取得でエラーになる場合があるが、Cookieファイルが生成されていればOK
                if os.path.exists(output_file) and os.path.getsize(output_file) > 0:
                     print(f"⚠️ エラーが出ましたが、Cookieファイルは生成されたようです: {output_file}")
                     return
                print(f"Error: {e}")

    print("\n❌ 全てのブラウザで取得に失敗しました。YouTubeにログインしているか確認してください。")

if __name__ == "__main__":
    extract_cookies()