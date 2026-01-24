import { createRoot } from 'react-dom/client';
import { createElement as h, useState } from 'react';
import './index.css';

// Contexts
import { AuthProvider, useAuth } from './context/auth-context';
import { VaultProvider } from './context/vault-context';
import { GamificationProvider } from './context/gamification-context';
import { AuditProvider } from './context/audit-context';

// Components
import { Layout } from './components/Layout';

// Screens
import { LoginScreen } from './screens/LoginScreen';
import { VaultScreen } from './screens/VaultScreen';
import { GeneratorScreen } from './screens/GeneratorScreen';
import { AnalyzerScreen } from './screens/AnalyzerScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { ThreatModelScreen } from './screens/ThreatModelScreen';
import { HomeScreen } from './screens/HomeScreen';
import { useEffect } from 'react';
import { useAudit } from './context/audit-context';

// Keyboard shortcut handler component
const KeyboardShortcutHandler = ({ panicLock, children }) => {
    const { addLog } = useAudit();

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+Shift+L for Panic Lock
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                panicLock(addLog);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [panicLock, addLog]);

    return children;
};


const AuthenticatedApp = () => {
    const { userKey, panicLock } = useAuth();
    const [activeTab, setActiveTab] = useState('vault');
    const [showHome, setShowHome] = useState(true);

    // Show home page only on first visit (before authentication)
    useEffect(() => {
        if (userKey) {
            setShowHome(false);
        }
    }, [userKey]);

    // If showing home page
    if (showHome && !userKey) {
        return h(HomeScreen, { onEnterVault: () => setShowHome(false) });
    }

    // If not authenticated, show login
    if (!userKey) {
        return h(LoginScreen);
    }

    const renderScreen = () => {
        switch (activeTab) {
            case 'vault': return h(VaultScreen);
            case 'generator': return h(GeneratorScreen);
            case 'analyzer': return h(AnalyzerScreen);
            case 'timeline': return h(TimelineScreen);
            case 'threats': return h(ThreatModelScreen);
            default: return h(VaultScreen);
        }
    };

    return h(AuditProvider, {},
        h(VaultProvider, {},
            h(GamificationProvider, {},
                h(KeyboardShortcutHandler, { panicLock },
                    h(Layout, { activeTab, onTabChange: setActiveTab },
                        renderScreen()
                    )
                )
            )
        )
    );
};

const App = () => {
    return h(AuthProvider, {},
        h(AuthenticatedApp)
    );
};

const root = document.getElementById('root');
if (root) {
    createRoot(root).render(h(App));
}
