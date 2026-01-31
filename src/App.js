import React, { useState, useEffect } from 'react';

const GITHUB_TOKEN = process.env.REACT_APP_GH_TOKEN;
const REPO_OWNER = "nexgenstudiostr";
const REPO_NAME = "Haber-panelim";

function App() {
  const [news, setNews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newSource, setNewSource] = useState("");
  const newsPerPage = 10;

  useEffect(() => {
    fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/data/news.json`)
      .then(res => res.json())
      .then(data => {
        // Haberleri yeniden eskiye sırala (Tarihe göre)
        const sortedNews = data.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        setNews(sortedNews);
      })
      .catch(err => console.error("Veri hatası:", err));
  }, []);

  // Sayfalama Mantığı
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = news.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(news.length / newsPerPage);

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f1f5f9', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '40px 20px', textAlign: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderBottom: '1px solid #334155' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-1px', color: '#38bdf8', margin: 0 }}>NEWS PORTAL</h1>
        <p style={{ color: '#94a3b8', marginTop: '10px' }}>En Güncel Haberler • Sayfa {currentPage}</p>
      </header>

      {/* Haber Listesi */}
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
        {currentNews.map((item, index) => (
          <a href={item.link} target="_blank" rel="noopener noreferrer" key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ 
              background: '#1e293b', padding: '25px', borderRadius: '16px', marginBottom: '20px', 
              transition: 'transform 0.2s, border-color 0.2s', border: '1px solid #334155', cursor: 'pointer' 
            }}
            onMouseOver={(e) => {e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = '#38bdf8'}}
            onMouseOut={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#334155'}}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#38bdf8', textTransform: 'uppercase' }}>{item.source || 'Haber Kaynağı'}</span>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(item.pubDate).toLocaleString('tr-TR')}</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', margin: '0 0 10px 0', lineHeight: '1.4' }}>{item.title}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.description?.substring(0, 150)}...</p>
            </div>
          </a>
        ))}

        {/* Sayfalama Butonları */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={navButtonStyle}>Önceki</button>
          <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} style={navButtonStyle}>Sonraki</button>
        </div>
      </main>

      {/* Admin Alt Alanı */}
      <footer style={{ background: '#1e293b', padding: '60px 20px', marginTop: '100px', borderTop: '1px solid #334155' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '20px' }}>Yönetim Paneli</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="text" 
              placeholder="RSS Kaynak Linki..." 
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
            />
            <button style={{ padding: '12px 24px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Ekle</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const navButtonStyle = {
  padding: '10px 20px',
  background: '#334155',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '600'
};

export default App;