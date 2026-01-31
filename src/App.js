import React, { useState, useEffect } from 'react';

const REPO_OWNER = "nexgenstudiostr";
const REPO_NAME = "Haber-panelim";

function App() {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newSource, setNewSource] = useState("");
  const newsPerPage = 10;

// Gelişmiş Tarih Formatlayıcı
  const formatDate = (dateString) => {
    if (!dateString) return "Tarih Belirtilmedi";
    
    // Bazı RSS kaynakları standart dışı tarih gönderebilir, temizleyelim
    const cleanedDate = dateString.replace('GMT', '').trim();
    const d = new Date(cleanedDate);

    // Eğer hala Invalid Date ise manuel bir deneme yapalım
    if (isNaN(d.getTime())) {
      try {
        // "31.01.2026 18:30" gibi bir format gelirse diye basit bir kontrol
        return dateString; 
      } catch (e) {
        return "Tarih Belirtilmedi";
      }
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
    fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/data/news.json?t=${new Date().getTime()}`)
      .then(res => res.json())
  .then(data => {
        const sortedNews = data.sort((a, b) => {
          const timeA = new Date(a.pubDate).getTime() || 0;
          const timeB = new Date(b.pubDate).getTime() || 0;
          return timeB - timeA; // Yeniden eskiye
        });
        setNews(sortedNews);
      })
      .catch(err => console.error("Veri yükleme hatası:", err));
  }, []);

  // Sayfalama Hesaplamaları
  const totalPages = Math.ceil(news.length / newsPerPage) || 1;
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f1f5f9', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <header style={{ padding: '30px 20px', textAlign: 'center', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#38bdf8', margin: 0 }}>HABER PORTALI</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>En Yeni Haberler • Sayfa {currentPage} / {totalPages}</p>
      </header>

      <main style={{ maxWidth: '850px', margin: '30px auto', padding: '0 20px' }}>
        {currentNews.length > 0 ? currentNews.map((item, index) => (
          <a href={item.link} target="_blank" rel="noopener noreferrer" key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#38bdf8' }}>{item.source || 'RSS KAYNAĞI'}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(item.pubDate)}</span>
              </div>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', lineHeight: '1.4' }}>{item.title}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{item.description?.substring(0, 120)}...</p>
            </div>
          </a>
        )) : <p style={{ textAlign: 'center' }}>Haberler yükleniyor veya bulunamadı...</p>}

        {/* Sayfalama Butonları */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
          <button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }} style={navButtonStyle}>← Önceki</button>
          <span style={{ fontWeight: '600' }}>{currentPage}</span>
          <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }} style={navButtonStyle}>Sonraki →</button>
        </div>
      </main>

      <footer style={{ background: '#1e293b', padding: '40px 20px', marginTop: '60px', borderTop: '1px solid #334155' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '15px' }}>Admin Kontrolü</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input 
              type="text" 
              placeholder="RSS Linki Girin..." 
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
            <button style={{ padding: '10px 15px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Ekle</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const cardStyle = {
  background: '#1e293b',
  padding: '20px',
  borderRadius: '12px',
  marginBottom: '15px',
  border: '1px solid #334155',
  transition: '0.2s'
};

const navButtonStyle = {
  padding: '8px 16px',
  background: '#334155',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  opacity: '0.9'
};

export default App;