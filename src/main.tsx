import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register offline service worker if available
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline cache setup fail-safe
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
