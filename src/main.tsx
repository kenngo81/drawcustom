import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AnnotateDemo } from './AnnotateDemo';
import './styles/standalone.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {new URLSearchParams(window.location.search).get('demo') === 'annotate' ? <AnnotateDemo /> : <App />}
  </React.StrictMode>
);
