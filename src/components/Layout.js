import { h, cn } from '../utils/ui';
import { useAuth } from '../context/auth-context';
import { useAudit } from '../context/audit-context';
import { useVault } from '../context/vault-context';

export const Layout = ({ children, activeTab, onTabChange }) => {
    const { logout, panicLock } = useAuth();
    const { addLog } = useAudit();
    const { healthScore } = useVault();

    // Determine color based on score
    let healthColor = 'text-red-500';
    let progressColor = 'bg-red-500';

    if (healthScore >= 50) { healthColor = 'text-yellow-500'; progressColor = 'bg-yellow-500'; }
    if (healthScore >= 80) { healthColor = 'text-neon-green'; progressColor = 'bg-neon-green'; }

    const navItems = [
        { id: 'vault', label: 'Vault', icon: '🔒' },
        { id: 'generator', label: 'Generator', icon: '⚡' },
        { id: 'analyzer', label: 'Analyzer', icon: '📊' },
        { id: 'timeline', label: 'Audit Log', icon: '📜' },
        { id: 'threats', label: 'Threat Model', icon: '🛡️' },
    ];

    return h('div', { className: 'flex h-screen w-full bg-black overflow-hidden' },
        // Sidebar
        h('aside', { className: 'w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col flex-shrink-0' },
            h('div', { className: 'p-6 flex items-center gap-3 border-b border-zinc-900/50' },
                h('div', { className: 'w-8 h-8 bg-neon-green rounded flex items-center justify-center text-black font-bold shadow-neon-sm' }, 'P'),
                h('span', { className: 'font-bold text-lg tracking-tight text-white' }, 'PassHygiene')
            ),
            h('nav', { className: 'flex-1 px-4 py-6 flex flex-col gap-2' },
                navItems.map(item =>
                    h('button', {
                        key: item.id,
                        onClick: () => onTabChange(item.id),
                        className: cn(
                            'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left w-full group',
                            activeTab === item.id
                                ? 'bg-zinc-900 text-neon-green shadow-inner border border-zinc-800/50'
                                : 'text-gray-400 hover:text-white hover:bg-zinc-900/30'
                        )
                    },
                        h('span', { className: cn('text-lg opacity-70 group-hover:opacity-100 transition-opacity', activeTab === item.id && 'opacity-100') }, item.icon),
                        item.label
                    )
                )
            ),
            h('div', { className: 'mt-auto p-4' },
                h('div', { className: 'bg-zinc-900 rounded-lg p-3 border border-zinc-800 mb-2' },
                    h('div', { className: 'flex justify-between text-xs mb-1 text-gray-300' },
                        h('span', {}, 'Vault Health'),
                        h('span', { className: cn('font-bold', healthColor) }, `${healthScore}%`)
                    ),
                    h('div', { className: 'h-1.5 bg-zinc-800 rounded-full overflow-hidden shadow-inner' },
                        h('div', {
                            className: cn('h-full shadow-neon-sm transition-all duration-1000 ease-out', progressColor),
                            style: { width: `${healthScore}%` }
                        })
                    ),
                    h('div', { className: 'text-[10px] text-gray-500 mt-2 text-center font-mono' }, healthScore === 100 ? 'Perfect Hygiene' : 'Needs Attention')
                ),
                h('button', {
                    onClick: () => panicLock(addLog),
                    className: 'flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg text-sm font-bold w-full px-4 py-2.5 transition-colors border border-red-900/50 hover:border-red-500/50 mb-2'
                },
                    h('span', { className: 'text-base' }, '🚨'),
                    'Panic Lock'
                ),
                h('button', {
                    onClick: logout,
                    className: 'flex items-center gap-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-sm font-medium w-full px-4 py-3 transition-colors'
                }, 'Exit Vault')
            )
        ),
        // Main Content
        h('main', { className: 'flex-1 overflow-auto bg-black p-8 relative' },
            h('div', { className: 'max-w-7xl mx-auto animate-in fade-in duration-500' },
                children
            )
        )
    );
};
