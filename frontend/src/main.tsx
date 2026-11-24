import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';
import { captureCampaign } from './lib/clickContext';

captureCampaign();

// index.html carries homepage meta tags for crawlers that don't run JavaScript.
// Each page sets its own through <SEO>, so drop the defaults to avoid duplicates.
document.querySelectorAll('[data-default-seo]').forEach((el) => el.remove());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
