/**
 * Simple backend for E-Kematho-Lek (Pi SDK demo-style)
 * - Endpoint: POST /verify  (verifikasi access token dari Pi)
 * - Endpoint: GET /        (health)
 *
 * Put your validation-key.txt (from Pi Developer Portal) into backend/validation-key.txt
 * Configure env in backend/.env (see .env.example)
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

app.get('/', (req, res) => {
  res.send('💜 E-Kematho-Pay API aktif dan berjalan.');
});

// POST /verify
// Body: { accessToken: "<token-from-frontend>" }
app.post('/verify', async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ error: 'accessToken diperlukan' });

  try {
    // contoh panggilan verifikasi ke Pi API (public user info)
    const resp = await axios.get('https://api.minepi.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 7000
    });

    // resp.data berisi info user (sesuai Pi API)
    return res.json({ success: true, user: resp.data });
  } catch (err) {
    console.error('Verifikasi accessToken gagal:', err?.response?.data || err.message);
    return res.status(401).json({ success: false, error: 'Token tidak valid / gagal diverifikasi' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 E-Kematho-Lek API berjalan di port ${PORT}`);
  // warn if validation-key not present (portal will give you this file after registering app)
  if (!fs.existsSync(VALIDATION_KEY_PATH)) {
    console.warn('⚠️ validation-key.txt TIDAK DITEMUKAN. Letakkan file dari Pi Developer Portal di:', VALIDATION_KEY_PATH);
  }
});
