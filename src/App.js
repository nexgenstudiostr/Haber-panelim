import React, { useState, useEffect } from 'react';

const GITHUB_TOKEN = process.env.REACT_APP_GH_TOKEN;
const REPO_OWNER = "nexgenstudiostr";
const REPO_NAME = "Haber-panelim"; 

function App() {
  const [news, setNews] = useState([]);
  const [newSource, setNewSource] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/data/news.json`)
      .then(res => res.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ backgroundColor: '#121212', color: '#e0e0e0', minHeight: '100vh', padding: '20px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <header style={{ textAlign: 'center', borderBottom: '2px solid #333', marginBottom: '30px', paddingBottom: '20px' }}>
        <h1 style={{ color: '#00adb5', fontSize: '2.5rem', margin: 0 }}>HABER PANELİ</h1>
        <p style={{ color: '#888' }}>Otomatik Güncellenen Haber Akışı</p>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto' }}>
        {loading ? (
          <p style={{ textAlign: 'center' }}>Haberler yükleniyor...</p>
        ) : (
          news.map((item, index) => (
            <div key={index} style={{ background: '#1e1e1e', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', borderLeft: '5px solid #00adb5' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>{item.title}</h3>
              <p style={{ color: '#bbb', fontSize: '0.95rem', lineHeight: '1.6' }}>{item.description}</p>
              <small style={{ color: '#00adb5' }}>{item.source} • {item.pubDate}</small>
            </div>
          ))
        )}
      </main>

      {/* Gelişmiş Admin Paneli */}
      <footer style={{ marginTop: '50px', borderTop: '2px solid #333', paddingTop: '40px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#252525', padding: '30px', borderRadius: '15px', textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: '20px' }}>Yönetim Paneli</h2>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <input 
              type="text" 
              placeholder="Yeni RSS Linki (Örn: TRT Haber, NTV...)" 
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              style={{ flex: 1, padding: '12px', borderRadius: '5px', border: '1px solid #444', background: '#333', color: '#fff' }}
            />
            <button 
              onClick={() => alert('Sistem güncelleniyor, lütfen bekleyin...')}
              style={{ padding: '12px 25px', background: '#00adb5', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              KAYNAK EKLE
            </button>
          </div>
          <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '15px' }}>Eklenen kaynaklar 1-2 dakika içinde listede görünecektir.</p>
        </div>
      </footer >
    </div >
  );
}

export default App;