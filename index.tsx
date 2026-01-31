

import React from 'react';
import { createRoot } from 'react-dom/client';
// Fix: Redirect import to the complete App component located in the views directory
import App from './views/App';
import { ErrorBoundary } from './components/ErrorBoundary';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
