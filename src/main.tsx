import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App'


document.body.innerHTML = '<div id="app"></div>';

const root = ReactDOM.createRoot(document.getElementById('app')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);