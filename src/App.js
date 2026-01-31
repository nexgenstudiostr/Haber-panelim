import React, { useState, useEffect } from 'react';

const GITHUB_TOKEN = process.env.REACT_APP_GH_TOKEN;
const REPO_OWNER = "nexgenstudiostr";
const REPO_NAME = "haber-panelim"; 

function App() {
  const [news, setNews] = useState([]);
  const [newSource, setNewSource] = useState("");

  useEffect(() => {
    fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/data/news.json`)
      .then(res => res.json())
      .then(data => setNews(data))
      .catch(err => console.log("Veri bekleniyor..."));
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>Haber Paneli</h1>
      <div className="news-list">
        {news.length > 0 ? news.map((n, i) => <div key={i}><h3>{n.title}</h3></div>) : <p>Haberler yükleniyor...</p>}
      </div>

      <div style={{ marginTop: '50px', padding: '20px', background: '#eee', borderRadius: '10px' }}>
        <h3>Admin Paneli</h3>
        <input 
          type="text" 
          value={newSource} 
          onChange={(e) => setNewSource(e.target.value)} 
          placeholder="RSS Linki..." 
          style={{ width: '70%', padding: '10px' }}
        />
        <button style={{ padding: '10px' }}>Kaydet</button>
      </div>
    </div>
  );
}
export default App;