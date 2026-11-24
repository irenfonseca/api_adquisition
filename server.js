
require('dotenv').config();
const express = require('express');

const app = express();
app.set('view engine', 'ejs');

const { PORT = 4001, KUNNA_URL, TOKEN, TIME_START, TIME_END } = process.env;
if (!KUNNA_URL || !TOKEN) { console.error('Faltan KUNNA_URL o TOKEN en .env'); process.exit(1); }

app.get('/', async (_req, res) => {
  try {
    const body = {
      time_range: {
        start: TIME_START,
        end: TIME_END
      },
      filters: [
        {
          field: 'magnitude',
          values: ['electricityfacility']
        },
        {
          field: 'device_id',
          values: ['6339566']
        }
      ],
      options: {
        limit: 4000
      }
    };

    const r = await fetch(KUNNA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-token-open-api': TOKEN
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) throw new Error(`KUNNA HTTP ${r.status}`);

    const json = await r.json();

    const records = json?.data?.records ?? [];
    const columns = records.length > 0 ? Object.keys(records[0]) : [];
    const values = records.slice(0, 5).map(row => columns.map(c => row[c]));

    res.render('index', { columns, values });

  } catch (e) {
    console.error(e);
    res.status(500).send('Error obteniendo datos');
  }
});

app.listen(PORT, () => console.log(`SSR en http://localhost:${PORT}`));
