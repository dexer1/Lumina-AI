import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './gen.jsx';
import AiAssistant from './AiAssistant.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <AiAssistant />
  </React.StrictMode>,
);
