/**
 * Simple backend for e-kematho-lek (Pi SDK demo-style)
 * - Endpoint: POST /verify  (verifikasi access token dari Pi)
 * - Endpoint: GET /         (health check)
 *
 * Letakkan file `validation-key.txt` (dari Pi Developer Portal)
 * di dalam folder backend/
 * Konfigurasikan environment di backend/.env (lihat .env.example)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.BACKEND_PORT || 5000;
const VALIDATION_KEY_PATH = process.env.VALIDATION_KEY_PATH || path.join(__dirname, 'validation-key.txt');

// Endpoint utama
app.get('/', (req, res) => {
  res.send('💜 e-kematho-lek API aktif dan berjalan.');
});

// POST /verify
// Body: { accessToken: "<token-dari-frontend>" }
app.post('/verify', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'accessToken diperlukan' });

  try {
    // Panggilan verifikasi ke Pi API (mendapatkan info user)
    const resp = await axios.get('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 7000
    });

    return res.json({ success: true, user: resp.data });
  } catch (err) {
    console.error('Verifikasi accessToken gagal:', err?.response?.data || err.message);
    return res.status(401).json({ success: false, error: 'Token tidak valid atau verifikasi gagal' });
  }
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`🚀 e-kematho-lek API berjalan di port ${PORT}`);

  if (!fs.existsSync(VALIDATION_KEY_PATH)) {
    console.warn('⚠️  validation-key.txt TIDAK DITEMUKAN. Letakkan file dari Pi Developer Portal di folder backend/');
  }
});
