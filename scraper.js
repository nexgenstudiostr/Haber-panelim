const RSSParser = require('rss-parser');
const fs = require('fs');
const parser = new RSSParser();

const SOURCES = [
  { name: 'Reuters', url: 'https://www.reutersagency.com/feed/' },
  { name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml' },
  { name: 'CFR', url: 'https://www.cfr.org/rss.xml' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' }
];

async function start() {
  let list = [];
  for (const source of SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      feed.items.forEach(item => {
        list.push({
          title: item.title,
          link: item.link, 
          pubDate: new Date(item.pubDate).toLocaleString('tr-TR'), // "Invalid Date" hatasını çözer
          sortDate: new Date(item.pubDate).getTime(),
          source: source.name
        });
      });
    } catch (e) { console.log(source.name + " hatası."); }
  }
  list.sort((a, b) => b.sortDate - a.sortDate);
  fs.writeFileSync('./src/data/news.json', JSON.stringify(list.slice(0, 100), null, 2));
}
start();
