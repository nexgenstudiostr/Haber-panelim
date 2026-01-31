const RSSParser = require('rss-parser');
const fs = require('fs');
const parser = new RSSParser();

// KÜRESEL PRESTİJLİ KAYNAKLAR
const SOURCES = [
  { name: 'Reuters', url: 'https://www.reutersagency.com/feed/' },
  { name: 'UN News', url: 'https://news.un.org/feed/subscribe/en/news/all/rss.xml' },
  { name: 'CFR', url: 'https://www.cfr.org/rss.xml' },
  { name: 'The Guardian', url: 'https://www.theguardian.com/world/rss' }
];

async function start() {
  let list = [];
  console.log("Küresel veriler toplanıyor...");

  for (const source of SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      feed.items.forEach(item => {
        list.push({
          title: item.title,
          description: item.contentSnippet || "",
          link: item.link, 
          pubDate: item.pubDate,
          sortDate: new Date(item.pubDate).getTime(),
          source: source.name
        });
      });
    } catch (e) { 
      console.log(source.name + " hatası:", e.message); 
    }
  }

  // Tarihe göre sırala (En yeni üstte)
  list.sort((a, b) => b.sortDate - a.sortDate); 

  // İlk 100 haberi kaydet
  const finalData = list.slice(0, 100);

  fs.writeFileSync('./src/data/news.json', JSON.stringify(finalData, null, 2));
  console.log("İşlem Başarılı: " + finalData.length + " haber kaydedildi.");
}

start();
