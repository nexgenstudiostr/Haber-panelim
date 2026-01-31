import React, { useState, useEffect } from 'react';

// Vercel üzerinden gelen Environment Variables
const GITHUB_TOKEN = process.env.REACT_APP_GH_TOKEN;
const REPO_OWNER = "nexgenstudiostr";
const REPO_NAME = "Haber-panelim";

function App() {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newSource, setNewSource] = useState("");
  const newsPerPage = 10;

  // Akıllı Tarih Formatlayıcı (Invalid Date hatasını önler)
  const formatDate = (dateString) => {
    if (!dateString) return "Yeni Haber";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      // Eğer tarih objesi oluşamazsa ham veriyi temizleyip gösterir
      return dateString.split(' ').slice(0, 4).join(' ');
    }
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    // Cache sorununu önlemek için timestamp ekliyoruz (?t=...)
    fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/data/news.json?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        // Haberleri tarihe göre yeniden eskiye sırala
        const sortedNews = data.sort((a, b) => {
          const timeA = new Date(a.pubDate).getTime() || 0;
          const timeB = new Date(b.pubDate).getTime() || 0;
          return timeB - timeA;
        });
        setNews(sortedNews);
      })
      .catch(err => console.error("Veri yükleme hatası:", err));
  }, []);

  // Admin Butonu Fonksiyonu (GitHub Action Tetikleyici)
  const handleAddSource = async () => {
    if (!newSource.includes("http")) {
      return alert("Lütfen geçerli bir RSS linki girin!");
    }

    if (!GITHUB_TOKEN) {
      return alert("Hata: GitHub Token (Environment Variable) bulunamadı!");
    }

    alert("İşlem başlatıldı. Bot yeni haberleri çekerken lütfen 1-2 dakika bekleyin.");

    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'update_news', 
          client_payload: { rss_url: newSource }
        })
      });

      if (response.ok) {
        alert("Başarılı! Kaynak eklendi, haberler birazdan güncellenecek.");
        setNewSource("");
      } else {
        alert("Bağlantı hatası: Yetki sorunu veya repo ayarları yanlış.");
      }
    } catch (err) {
      alert("Bir hata oluştu: " + err.message);
    }
  };

  // Sayfalama Mantığı
  const totalPages = Math.ceil(news.length / newsPerPage) || 1;
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '30px 20px', textAlign: 'center', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '1.8rem' }}>HABER PANELİM</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '5px' }}>Sayfa {currentPage} / {totalPages}</p>
      </header>

      {/* Haber Listesi */}
      <main style={{ maxWidth: '800px', margin: '20px auto', padding: '0 15px' }}>
        {currentNews.length > 0 ? currentNews.map((item, index) => (
          <a href={item.link} target="_blank" rel="noopener noreferrer" key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 'bold' }}>{item.source || 'RSS'}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(item.pubDate)}</span>
              </div>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 10px 0', lineHeight: '1.4' }}>{item.title}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{item.description?.substring(0, 150)}...</p>
            </div>
          </a>
        )) : <p style={{ textAlign: 'center' }}>Haberler yükleniyor...</p>}

        {/* Sayfalama Butonları */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px', paddingBottom: '30px' }}>
          <button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }} style={btnStyle}>← Geri</button>
          <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }} style={btnStyle}>İleri →</button>
        </div>
      </main>

      {/* Admin Paneli */}
      <footer style={{ background: '#1e293b', padding: '40px 20px', borderTop: '1px solid #334155' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>Admin Kontrolü</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="RSS Linki (Örn: https://gzt.com/rss)" 
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
            <button onClick={handleAddSource} style={{ ...btnStyle, background: '#38bdf8', color: '#0f172a' }}>Ekle</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const btnStyle = {
  padding: '10px 20px',
  background: '#334155',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default App;