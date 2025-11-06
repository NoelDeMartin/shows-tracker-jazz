import './index.css';
import App from './App.tsx';
import { JazzReactProvider } from 'jazz-tools/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Account } from 'jazz-tools';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <JazzReactProvider
            sync={{
                peer: import.meta.env.VITE_JAZZ_PEER,
                when: 'signedUp',
            }}
            AccountSchema={Account}
        >
            <App />
        </JazzReactProvider>
    </StrictMode>,
);
