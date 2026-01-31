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

  // Veriyi GitHub'dan Çekme
  const fetchNews = async () => {
    setLoading(true);
    try {
      // ?t= ekleyerek Vercel'in önbelleğini (cache) kırıyoruz, her zaman en güncel dosyayı çeker
      const response = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/data/news.json?t=${new Date().getTime()}`);
      const data = await response.json();
      const sorted = data.sort((a, b) => (new Date(b.pubDate).getTime() || 0) - (new Date(a.pubDate).getTime() || 0));
      setNews(sorted);
      setFilteredNews(sorted);
    } catch (err) {
      console.error("Haberler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Kaynağa Göre Filtrele
  useEffect(() => {
    if (selectedSource === "Tümü") {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.source === selectedSource));
    }
  }, [selectedSource, news]);

  // Dinamik Butonlar: Haber verisindeki 'source' alanından otomatik üretilir
  const sources = ["Tümü", ...new Set(news.map(item => item.source).filter(Boolean))];

  const handleAddSource = async () => {
    if (!newSource.includes("http")) return alert("Geçerli bir RSS linki girin!");
    
    // Kullanıcıya bilgi ver
    alert("Kaynak eklendi! Arka planda veriler işleniyor. 1 dakika içinde sayfa otomatik güncellenecek.");

    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
        method: 'POST',
        headers: { 
          'Authorization': `token ${GITHUB_TOKEN}`, 
          'Accept': 'application/vnd.github.v3+json', 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ event_type: 'update_news', client_payload: { rss_url: newSource } })
      });

      if (response.ok) {
        setNewSource("");
        // 1 dakika sonra otomatik yenileme tetikle (Botun işini bitirmesi için süre tanıyoruz)
        setTimeout(() => {
          fetchNews();
        }, 60000); 
      }
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const totalPages = Math.ceil(filteredNews.length / newsPerPage) || 1;
  const currentItems = filteredNews.slice((currentPage - 1) * newsPerPage, currentPage * newsPerPage);

  const formatDate = (dateString) => {
    if (!dateString) return "Yeni";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? dateString.substring(0,16) : d.toLocaleString('tr-TR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
  };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '20px', textAlign: 'center', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <h1 style={{ color: '#38bdf8', margin: 0 }}>HABER PANELİM</h1>
      </header>

      {/* OTOMATİK EKLENEN KAYNAK BUTONLARI */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', padding: '15px' }}>
        {sources.map(source => (
          <button
            key={source}
            onClick={() => { setSelectedSource(source); setCurrentPage(1); }}
            style={{
              padding: '6px 12px', borderRadius: '15px', border: 'none', cursor: 'pointer', fontSize: '0.85rem',
              backgroundColor: selectedSource === source ? '#38bdf8' : '#334155',
              color: selectedSource === source ? '#0f172a' : '#fff'
            }}
          >
            {source}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '10px' }}>
        {loading ? <p style={{ textAlign: 'center' }}>Güncel haberler çekiliyor...</p> : 
          currentItems.map((item, index) => (
            <a href={item.link} target="_blank" rel="noopener noreferrer" key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: '#1e293b', padding: '15px', borderRadius: '10px', marginBottom: '10px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '5px' }}>
                  <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{item.source}</span>
                  <span style={{ color: '#94a3b8' }}>{formatDate(item.pubDate)}</span>
                </div>
                <h2 style={{ fontSize: '1rem', margin: 0 }}>{item.title}</h2>
              </div>
            </a>
          ))
        }

        {/* Sayfalama */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '20px' }}>
          <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0,0); }} style={btnStyle}>Geri</button>
          <span style={{ alignSelf: 'center' }}>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0,0); }} style={btnStyle}>İleri</button>
        </div>
      </main>

      <footer style={{ background: '#1e293b', padding: '30px 20px', marginTop: '40px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ marginBottom: '10px', fontWeight: 'bold' }}>Haber Kaynağı Ekle</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" placeholder="RSS URL" value={newSource} onChange={(e) => setNewSource(e.target.value)} style={{ flex: 1, padding: '8px', borderRadius: '5px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
            <button onClick={handleAddSource} style={{ ...btnStyle, background: '#38bdf8', color: '#0f172a' }}>Ekle</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const btnStyle = { padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' };

export default App;