import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🚀 main.jsx loading...');
const root = document.getElementById('root');
console.log('Root element:', root);

if (!root) {
  throw new Error('Root element not found!');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

console.log('✅ React app rendered');