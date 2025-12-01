import json

import google.generativeai as genai

from .config import GEMINI_API_KEY


class AIAnalyst:
    def __init__(self):
        if GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
        else:
            self.model = None

    def analyze_market_impact(self, portfolio_data, news_list):
        if not self.model:
            return {"error": "Gemini API Key not configured"}

        print(f"DEBUG: portfolio_data type: {type(portfolio_data)}")
        print(f"DEBUG: news_list type: {type(news_list)}")

        try:
            prompt = f"""
            あなたは辛口の金融アナリスト「ずんだもん」です。以下のポートフォリオと最新ニュースに基づいて、市場の影響を分析し、ポッドキャスト風のスクリプトを作成してください。
            
            ポートフォリオ:
            {json.dumps(portfolio_data, indent=2, ensure_ascii=False)}
            
            ニュース:
            {json.dumps(news_list, indent=2, ensure_ascii=False)}
            
            指示:
            1. ニュースの発行日時（published）を確認し、最新の情報を優先してください。
            2. ニュースの中から、私のポートフォリオ（特に保有銘柄や関連セクター）に影響がありそうなものを優先的にピックアップしてください。関連性の低いニュースは無視してください。
            3. 語尾は「〜なのだ」「〜なのだよ」などの「ずんだもん」口調を使用してください。
            4. 辛口かつユーモアを交えて、投資家（私）にアドバイスや警告を行ってください。
            5. **重要**: 分析に使用したニュース記事のソース（タイトルとリンク）を必ずJSONの `sources` フィールドに含めてください。
            
            出力形式:
            必ず以下のJSON形式のみを出力してください。Markdownのコードブロック（```json ... ```）で囲んでください。
            {{
                "title": "レポートのタイトル",
                "summary": "概要",
                "script": "ポッドキャスト風のスクリプト（ずんだもん口調で）",
                "sources": [
                    {{ "title": "記事タイトル1", "link": "記事URL1 (必ず入力ニュースのlinkをそのまま使用)" }},
                    {{ "title": "記事タイトル2", "link": "記事URL2 (必ず入力ニュースのlinkをそのまま使用)" }}
                ]
            }}
            """
        except Exception as e:
            print(f"ERROR constructing prompt: {e}")
            return {"error": f"Error constructing prompt: {e}"}

        try:
            response = self.model.generate_content(prompt)
            # GeminiのレスポンスからJSONを抽出する簡易的な処理
            import re
            text = response.text
            print(f"DEBUG: Raw Gemini response: {text}")

            # Try to find JSON block
            match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
            if match:
                json_str = match.group(1)
            else:
                # If no code block, try to parse the whole text or find the first { and last }
                json_str = text
                start_idx = text.find('{')
                end_idx = text.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    json_str = text[start_idx:end_idx+1]

            # Clean up potential control characters if needed, though json.loads usually handles standard ones.
            # Sometimes Gemini adds comments or trailing commas which standard json lib hates, but let's try basic load first.
            data = json.loads(json_str)
            
            # Ensure sources is a list
            if "sources" not in data:
                data["sources"] = []
            
            return data

        except Exception as e:
            print(f"ERROR in AI generation: {e}")
            # Fallback: Create a basic response using the news list directly
            return {
                "title": "市場分析（AI生成失敗）",
                "summary": "AIによる分析の生成に失敗しましたが、最新のニュースをお届けします。",
                "script": "申し訳ないのだ。AIの調子が悪くて分析できなかったのだ。でもニュースはチェックしてほしいのだ。",
                "sources": [{"title": n.get("title"), "link": n.get("link")} for n in news_list[:5]]
            }
        
        # Post-processing to ensure sources exist
        if "sources" not in data or not data["sources"]:
            print("WARN: AI did not return sources. Using fallback.")
            data["sources"] = [{"title": n.get("title"), "link": n.get("link")} for n in news_list[:5]]
        
        return data
