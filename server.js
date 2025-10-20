require('dotenv').config();
const express = require('express');

const app = express();
app.set('view engine', 'ejs');

const { PORT = 4000, KUNNA_URL, TIME_START, TIME_END } = process.env;
if (!KUNNA_URL) { console.error('Falta KUNNA_URL en .env'); process.exit(1); }

app.get('/', async (_req, res) => {
  try {
    const body = {
      time_start: TIME_START,
      time_end: TIME_END,
      limit: 100,
      count: false,
      order: 'DESC'
    };

    const r = await fetch(KUNNA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!r.ok) throw new Error(`KUNNA HTTP ${r.status}`);

    const json = await r.json();

    const columns = json?.result?.columns ?? [];
    const values = (json?.result?.values ?? []).slice(0, 5);

    res.render('index', { columns, values });
    
  } catch (e) {
    console.error(e);
    res.status(500).send('Error obteniendo datos');
  }
});

app.listen(PORT, () => console.log(`SSR en http://localhost:${PORT}`));
