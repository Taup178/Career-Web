
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './polish.css';
import './project-previews.css';
import './arcade.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
