import React, { useState, useEffect } from 'react';

const GITHUB_TOKEN = process.env.REACT_APP_GH_TOKEN;
const REPO_OWNER = "nexgenstudiostr";
const REPO_NAME = "Haber-panelim";

function App() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [selectedSource, setSelectedSource] = useState("Tümü");
  const [currentPage, setCurrentPage] = useState(1);
  const [newSource, setNewSource] = useState("");
  const [loading, setLoading] = useState(true);
  const newsPerPage = 10;

  // 1. Veriyi her seferinde taptaze çekmek için fonksiyon
  const fetchNews = async () => {
    setLoading(true);
    try {
      // URL sonuna eklenen timestamp (?t=...) Vercel ve Tarayıcı önbelleğini zorla kırar
      const response = await fetch(
        `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/data/news.json?t=${new Date().getTime()}`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      
      // Yeniden eskiye sıralama
      const sorted = data.sort((a, b) => {
        const dateA = new Date(a.pubDate).getTime() || 0;
        const dateB = new Date(b.pubDate).getTime() || 0;
        return dateB - dateA;
      });

      setNews(sorted);
      setFilteredNews(sorted);
    } catch (err) {
      console.error("Veri çekme hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Her 2 dakikada bir otomatik arka plan güncellemesi
    const interval = setInterval(fetchNews, 120000);
    return () => clearInterval(interval);
  }, []);

  // 2. Kaynak Seçme Butonları (Otomatik ve Dinamik)
  const sources = ["Tümü", ...new Set(news.map(item => item.source).filter(Boolean))];

  useEffect(() => {
    if (selectedSource === "Tümü") {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.source === selectedSource));
    }
  }, [selectedSource, news]);

  // 3. Admin Kayıt ve Anında Tetikleme
  const handleAddSource = async () => {
    if (!newSource.startsWith("http")) return alert("Geçerli bir RSS linki girin!");
    
    alert("Kaynak GitHub'a iletildi. Bot haberleri toplarken (yaklaşık 60 saniye) liste otomatik güncellenecek.");

    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
        method: 'POST',
        headers: { 
          'Authorization': `token ${GITHUB_TOKEN}`, 
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ 
          event_type: 'update_news', 
          client_payload: { rss_url: newSource } 
        })
      });

      if (response.ok) {
        setNewSource("");
        // Botun işini bitirmesi için 45 saniye sonra veriyi tekrar çek
        setTimeout(fetchNews, 45000);
      }
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const currentItems = filteredNews.slice((currentPage - 1) * newsPerPage, currentPage * newsPerPage);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage) || 1;

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '20px', textAlign: 'center', backgroundColor: '#1e293b', borderBottom: '1px solid #334155' }}>
        <h1 style={{ color: '#38bdf8', fontSize: '1.5rem', margin: 0 }}>HABER PANELİM</h1>
      </header>

      {/* Kaynak Filtreleme Butonları */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', padding: '15px' }}>
        {sources.map(s => (
          <button
            key={s}
            onClick={() => { setSelectedSource(s); setCurrentPage(1); }}
            style={{
              padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              backgroundColor: selectedSource === s ? '#38bdf8' : '#334155',
              color: selectedSource === s ? '#0f172a' : '#fff',
              fontSize: '0.8rem', fontWeight: 'bold'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '10px' }}>
        {loading && news.length === 0 ? <p style={{ textAlign: 'center' }}>Haberler yükleniyor...</p> : 
          currentItems.map((item, i) => (
            <a href={item.link} target="_blank" rel="noopener noreferrer" key={i} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#1e293b', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '8px' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{item.source}</span>
                  <span>{new Date(item.pubDate).toLocaleString('tr-TR')}</span>
                </div>
                <h2 style={{ fontSize: '1rem', margin: 0, lineHeight: '1.4' }}>{item.title}</h2>
              </div>
            </a>
          ))
        }

        {/* Sayfalama */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', padding: '20px' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={navBtn}>Geri</button>
          <span style={{ alignSelf: 'center' }}>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={navBtn}>İleri</button>
        </div>
      </main>

      <footer style={{ backgroundColor: '#1e293b', padding: '30px', marginTop: '50px' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <input 
            type="text" placeholder="RSS Linki Ekle..." value={newSource}
            onChange={e => setNewSource(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '5px', background: '#0f172a', border: '1px solid #334155', color: '#fff', marginBottom: '10px' }}
          />
          <button onClick={handleAddSource} style={{ width: '100%', padding: '10px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
            Haber Kaynağını Kaydet
          </button>
        </div>
      </footer>
    </div>
  );
}

const navBtn = { padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };

export default App;