import { useState } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setStatus('');

    const endpoint = 'http://127.0.0.1:3002/log-connection';
    const payload = { message: 'Le client est connecté.' };
    console.log('[App] Sending request to backend:', endpoint, payload);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('[App] Response status:', response.status, response.statusText);

      const data = await response.json();
      console.log('[App] Response JSON:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de l’envoi au serveur.');
      }
      setStatus(`OK : ${data.message}`);
    } catch (error) {
      console.error('[App] Fetch error:', error);
      setStatus(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Oracle Devoir</h1>
      <p>Bienvenue sur l'application Oracle Devoir. Cette application est conçue pour se connecter à une base de données Oracle et afficher les données de manière interactive.</p>
      <button className='addData' onClick={handleClick} disabled={loading}>
        {loading ? 'Envoi...' : 'Envoyer connexion'}
      </button>
      {status && <p>{status}</p>}
    </>
  )
}

export default App
