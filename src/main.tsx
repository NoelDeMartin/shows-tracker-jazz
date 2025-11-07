import './index.css';
import App from './App.tsx';
import { JazzReactProvider } from 'jazz-tools/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { JazzInspector } from 'jazz-tools/inspector';
import { Account } from './schema/Account.ts';

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
            {import.meta.env.DEV && <JazzInspector />}
        </JazzReactProvider>
    </StrictMode>,
);
