import logging
import feedparser

logger = logging.getLogger(__name__)

class NewsAggregator:
    def __init__(self):
        self.sources = [
            "https://news.yahoo.co.jp/rss/categories/business.xml",
            "https://www.bloomberg.co.jp/rss/news.xml"
        ]

    def fetch_latest(self, limit=5):
        """
        Fetches latest news from RSS feeds.
        Returns a combined list of news items.
        """
        articles = []
        for url in self.sources:
            try:
                # Add User-Agent to avoid blocking
                feed = feedparser.parse(url, agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                # Check for bozo exception (malformed XML etc)
                if feed.bozo:
                    logger.warning(f"Feed error for {url}: {feed.bozo_exception}")
                    continue

                for entry in feed.entries[:limit]:
                    articles.append({
                        "title": entry.title,
                        "link": entry.link,
                        "summary": getattr(entry, "summary", ""),
                        "source": feed.feed.get("title", "Unknown")
                    })
            except Exception as e:
                logger.error(f"Failed to parse feed {url}: {e}")
        
        logger.info(f"Fetched {len(articles)} articles.")
        for article in articles:
            logger.debug(f" - {article['title']} ({article['link']})")
        return articles
