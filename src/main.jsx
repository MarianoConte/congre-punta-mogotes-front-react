import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { SnackbarProvider } from 'notistack';

const client = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      {/* <ReactQueryDevtools /> */}
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
