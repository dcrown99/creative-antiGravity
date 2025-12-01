import sys
import os
import unittest
from unittest.mock import MagicMock, patch

# Add src to path
sys.path.append(os.path.join(os.getcwd(), 'apps', 'market-watcher', 'src'))

from analyst import AIAnalyst

class TestAIAnalyst(unittest.TestCase):
    def setUp(self):
        # Mock config
        self.patcher = patch('analyst.GEMINI_API_KEY', 'fake_key')
        self.patcher.start()
        
        # Mock genai
        self.genai_patcher = patch('analyst.genai')
        self.mock_genai = self.genai_patcher.start()
        
        self.analyst = AIAnalyst()

    def tearDown(self):
        self.patcher.stop()
        self.genai_patcher.stop()

    def test_fallback_logic(self):
        # Mock model response to return JSON without sources
        mock_response = MagicMock()
        mock_response.text = '''
        ```json
        {
            "title": "Test Title",
            "summary": "Test Summary",
            "script": "Test Script"
        }
        ```
        '''
        self.analyst.model.generate_content.return_value = mock_response

        news_list = [
            {"title": "News 1", "link": "http://example.com/1", "summary": "Summary 1"},
            {"title": "News 2", "link": "http://example.com/2", "summary": "Summary 2"}
        ]
        portfolio_data = {"assets": []}

        result = self.analyst.analyze_market_impact(portfolio_data, news_list)

        # Check if sources are populated from input news_list
        self.assertIn("sources", result)
        self.assertEqual(len(result["sources"]), 2)
        self.assertEqual(result["sources"][0]["title"], "News 1")
        self.assertEqual(result["sources"][0]["link"], "http://example.com/1")
        print("Fallback logic verified: Sources populated from input.")

    def test_exception_fallback(self):
        # Mock model to raise exception
        self.analyst.model.generate_content.side_effect = Exception("API Error")

        news_list = [
            {"title": "News 1", "link": "http://example.com/1", "summary": "Summary 1"}
        ]
        portfolio_data = {"assets": []}

        result = self.analyst.analyze_market_impact(portfolio_data, news_list)

        # Check if fallback response is returned
        self.assertEqual(result["title"], "市場分析（AI生成失敗）")
        self.assertIn("sources", result)
        self.assertEqual(result["sources"][0]["link"], "http://example.com/1")
        print("Exception fallback verified.")

if __name__ == '__main__':
    unittest.main()
