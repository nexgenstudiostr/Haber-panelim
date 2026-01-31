const RSSParser = require('rss-parser');
const fs = require('fs');
const parser = new RSSParser();

// BURAYA İSTEDİĞİN RSS LİNKLERİNİ EKLEYEBİLİRSİN
const SOURCES = [
  'https://www.cnnturk.com/feed/rss/all/news',
  'https://www.haberturk.com/rss',
  'https://www.ntv.com.tr/gundem.rss'
];

async function start() {
  let list = [];
  console.log("Haberler çekilmeye başlanıyor...");

  for (const url of SOURCES) {
    try {
      const feed = await parser.parseURL(url);
      feed.items.forEach(item => {
        list.push({
          title: item.title,
          description: item.contentSnippet,
          link: item.link, 
          // 1. ADIM: Orijinal tarihi ham metin olarak sakla (Saat farkını önlemek için)
          originalDate: item.pubDate, 
          // 2. ADIM: Sıralama yapabilmek için sayısal tarihe çevir
          sortDate: new Date(item.pubDate).getTime(),
          source: feed.title
        });
      });
    } catch (e) { 
      console.log("Kaynak hatası (" + url + "):", e.message); 
    }
  }

  // 3. ADIM: KESİN SIRALAMA - En yeni (büyük sayı) en üstte
  list.sort((a, b) => b.sortDate - a.sortDate); 

  // 4. ADIM: VERİYİ KAYDET - Sayfalama için ilk 100 haberi alalım
  const finalData = list.slice(0, 100);

  fs.writeFileSync('./src/data/news.json', JSON.stringify(finalData, null, 2));
  console.log("SUCCESSFULLY: " + finalData.length + " adet haber güncelden eskiye sıralanarak kaydedildi.");
}

// Fonksiyonu çalıştır
start();