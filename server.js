import express from 'express';
import cors from 'cors';
import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

const dbConfig = {
  user: process.env.DB_USER || 'YOUR_DB_USER',
  password: process.env.DB_PASSWORD || 'YOUR_DB_PASSWORD',
  connectString: process.env.DB_CONNECT_STRING || 'localhost/XE'
};

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log('[Server] Incoming request:', req.method, req.url);
  next();
});

app.get('/', (req, res) => {
  res.send('Serveur Node.js actif.');
});

app.get('/test-connection', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute('SELECT 1 FROM dual');
    res.json({ status: 'ok', result: result.rows });
  } catch (error) {
    console.error('Oracle connection error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Error closing Oracle connection:', closeError);
      }
    }
  }
});

app.post('/log-connection', async (req, res) => {
  let connection;
  const message = req.body?.message || 'Connexion du client';
  console.log('[Server] /log-connection body:', req.body);

  try {
    connection = await oracledb.getConnection(dbConfig);
    console.log('[Server] Oracle connection opened');
    await connection.execute(
      `INSERT INTO CONNECTION_LOG (message, created_at) VALUES (:message, SYSTIMESTAMP)`,
      { message },
      { autoCommit: true }
    );
    console.log('[Server] Insert completed');
    res.json({ status: 'ok', message: 'Message enregistré en base.' });
  } catch (error) {
    console.error('[Server] Oracle log-connection error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('[Server] Oracle connection closed');
      } catch (closeError) {
        console.error('[Server] Error closing Oracle connection:', closeError);
      }
    }
  }
});

app.get('/data', async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(
      `SELECT * FROM YOUR_TABLE WHERE ROWNUM <= 20`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json({ rows: result.rows });
  } catch (error) {
    console.error('Oracle query error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Error closing Oracle connection:', closeError);
      }
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
