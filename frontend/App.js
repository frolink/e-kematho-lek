import React, { useState, useEffect } from 'react';

const API_BASE = 'https://e-kematho-backend.vercel.app';

function App() {
  const [status, setStatus] = useState('Memeriksa SDK...');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (window.Pi && typeof window.Pi.init === 'function') {
      try {
        window.Pi.init({ version: '2.0', sandbox: true });
        console.log('✅ Pi SDK ready (sandbox).');
        setStatus('✅ SDK Pi terdeteksi.');
      } catch (e) {
        console.error('Pi.init error', e);
        setStatus('❌ Gagal inisialisasi Pi SDK.');
      }
    } else {
      setStatus('⚠️ Pi SDK tidak ditemukan (gunakan Pi Browser atau sandbox).');
    }
  }, []);

  const login = async () => {
    if (!window.Pi || !window.Pi.authenticate) {
      alert('Pi SDK tidak tersedia. Buka halaman ini di Pi Browser atau gunakan sandbox.');
      return;
    }

    setStatus('🔄 Memulai autentikasi...');
    try {
      const scopes = ['username', 'payments'];
      const auth = await window.Pi.authenticate(scopes);
      console.log('auth result', auth);

      // Kirim accessToken ke backend untuk verifikasi
      const res = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: auth.accessToken })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verifikasi gagal');

      setUser(data.user);
      setStatus('✅ Login & verifikasi sukses.');
    } catch (err) {
      console.error(err);
      setStatus('❌ Login/Verifikasi gagal: ' + (err.message || err));
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>💜 E-Kematho-Pay (Demo)</h1>
      <p>{status}</p>

      {!user ? (
        <button onClick={login}>Login dengan Pi Network</button>
      ) : (
        <div>
          <h3>Halo, {user.username}</h3>
          <pre style={{ background: '#f4f4f4', padding: 10 }}>
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}

      <p style={{ marginTop: 20 }}>Backend: {API_BASE}</p>
    </div>
  );
}

export default App;
