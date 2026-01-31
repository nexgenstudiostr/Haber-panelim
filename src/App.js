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
  const newsPerPage = 10;

  const formatDate = (dateString) => {
    if (!dateString) return "Yeni Haber";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString.split(' ').slice(0, 4).join(' ');
    return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/data/news.json?t=${new Date().getTime()}`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => (new Date(b.pubDate).getTime() || 0) - (new Date(a.pubDate).getTime() || 0));
        setNews(sorted);
        setFilteredNews(sorted); // Başlangıçta tümünü göster
      })
      .catch(err => console.error(err));
  }, []);

  // Filtreleme Fonksiyonu
  const filterBySource = (sourceName) => {
    setSelectedSource(sourceName);
    setCurrentPage(1); // Sayfayı başa sar
    if (sourceName === "Tümü") {
      setFilteredNews(news);
    } else {
      setFilteredNews(news.filter(item => item.source === sourceName));
    }
  };

  // Dinamik Kaynak Listesi Oluşturma (Haberlerdeki kaynak isimlerini çekiyoruz)
  const sources = ["Tümü", ...new Set(news.map(item => item.source).filter(Boolean))];

  const handleAddSource = async () => {
    if (!newSource.includes("http")) return alert("Geçerli bir link girin!");
    alert("İşlem başlatıldı, 1-2 dakika içinde yansıyacaktır.");
    try {
      const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`, {
        method: 'POST',
        headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'update_news', client_payload: { rss_url: newSource } })
      });
      if (response.ok) { setNewSource(""); }
    } catch (err) { alert(err.message); }
  };

  const totalPages = Math.ceil(filteredNews.length / newsPerPage) || 1;
  const currentItems = filteredNews.slice((currentPage - 1) * newsPerPage, currentPage * newsPerPage);

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f1f5f9', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <header style={{ padding: '30px 20px', textAlign: 'center', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        <h1 style={{ color: '#38bdf8', margin: 0 }}>HABER PANELİM</h1>
      </header>

      {/* KAYNAK SEÇİCİ BUTONLAR */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', padding: '20px', backgroundColor: '#0f172a' }}>
        {sources.map(source => (
          <button
            key={source}
            onClick={() => filterBySource(source)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: selectedSource === source ? '#38bdf8' : '#334155',
              color: selectedSource === source ? '#0f172a' : '#fff',
              transition: '0.3s'
            }}
          >
            {source}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: '800px', margin: '10px auto', padding: '0 15px' }}>
        {currentItems.length > 0 ? currentItems.map((item, index) => (
          <a href={item.link} target="_blank" rel="noopener noreferrer" key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '15px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 'bold' }}>{item.source}</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{formatDate(item.pubDate)}</span>
              </div>
              <h2 style={{ fontSize: '1.1rem', margin: '0 0 10px 0' }}>{item.title}</h2>
            </div>
          </a>
        )) : <p style={{ textAlign: 'center' }}>Bu kaynağa ait haber bulunamadı.</p>}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '20px' }}>
          <button disabled={currentPage === 1} onClick={() => { setCurrentPage(prev => prev - 1); window.scrollTo(0,0); }} style={btnStyle}>← Geri</button>
          <span style={{ alignSelf: 'center' }}>{currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => { setCurrentPage(prev => prev + 1); window.scrollTo(0,0); }} style={btnStyle}>İleri →</button>
        </div>
      </main>

      <footer style={{ background: '#1e293b', padding: '40px 20px', borderTop: '1px solid #334155', marginTop: '50px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '15px' }}>Yeni Kaynak Ekle</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="RSS Linki" value={newSource} onChange={(e) => setNewSource(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }} />
            <button onClick={handleAddSource} style={{ ...btnStyle, background: '#38bdf8', color: '#0f172a' }}>Ekle</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

const btnStyle = { padding: '10px 20px', background: '#334155', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default App;