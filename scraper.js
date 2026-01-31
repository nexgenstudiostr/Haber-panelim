const RSSParser = require('rss-parser');
const fs = require('fs');
const parser = new RSSParser();

// YENİ DÜNYA GÜNDEMİ VE BELGE ODAKLI KAYNAKLAR
const SOURCES = [
  'https://www.reutersagency.com/feed/',        // Reuters - Küresel Ajans
  'https://news.un.org/feed/subscribe/en/news/all/rss.xml', // UN News - BM Raporları
  'https://www.cfr.org/rss.xml',                // CFR - Jeopolitik Analiz
  'https://www.theguardian.com/world/rss',      // The Guardian - Dünya Haberleri
  'https://thecradleturkiye.com/feed/',         // The Cradle - Stratejik Analiz
  'https://www.justice.gov/news/rss'            // DOJ - Resmi Belgeler
];

async function start() {
  let list = [];
  console.log("Küresel kaynaklardan veriler çekiliyor...");

  for (const url of SOURCES) {
    try {
      const feed = await parser.parseURL(url);
      feed.items.forEach(item => {
        list.push({
          title: item.title,
          description: item.contentSnippet || "",
          link: item.link, 
          originalDate: item.pubDate, 
          sortDate: new Date(item.pubDate).getTime(),
          // Kaynak ismini daha okunaklı yapalım
          source: feed.title.includes("Reuters") ? "Reuters" : 
                  feed.title.includes("UN News") ? "UN News" : 
                  feed.title.includes("Council on Foreign Relations") ? "CFR" : 
                  feed.title.includes("The Guardian") ? "The Guardian" : feed.title
        });
      });
    } catch (e) { 
      console.log("Kaynak hatası (" + url + "):", e.message); 
    }
  }

  // En yeni haber en üstte olacak şekilde sırala
  list.sort((a, b) => b.sortDate - a.sortDate); 

  // İlk 100 haberi al ve kaydet
  const finalData = list.slice(0, 100);

  fs.writeFileSync('./src/data/news.json', JSON.stringify(finalData, null, 2));
  console.log("BAŞARILI: " + finalData.length + " adet küresel haber ve belge kaydedildi.");
}

start();
