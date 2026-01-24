import { h } from '../utils/ui';
import { Button } from '../components/Button';
import { useAudit } from '../context/audit-context';

export const TimelineScreen = () => {
    const { events, clearLogs } = useAudit();

    const handleClear = async () => {
        if (confirm('Are you sure you want to clear the audit log? This cannot be undone.')) {
            await clearLogs();
        }
    };

    // Icon mapping based on event type
    const getIcon = (type) => {
        switch (type) {
            case 'create': return '📝';
            case 'delete': return '🗑️';
            case 'warning': return '⚠️';
            default: return '🔒';
        }
    };

    return h('div', { className: 'max-w-3xl mx-auto flex flex-col gap-8' },
        h('div', { className: 'flex justify-between items-end' },
            h('div', {},
                h('h1', { className: 'text-3xl font-bold text-white mb-2' }, 'Audit Log'),
                h('p', { className: 'text-gray-400' }, 'Recent security events and actions.')
            ),
            events.length > 0 && h(Button, {
                variant: 'ghost',
                onClick: handleClear,
                className: 'text-zinc-500 hover:text-red-500' // Subtle until hovered
            }, 'Clear Logs')
        ),

        events.length === 0
            ? h('div', { className: 'text-center py-20 text-gray-500' }, 'No events logged yet.')
            : h('div', { className: 'relative border-l border-zinc-800 ml-4 space-y-8 pb-10' },
                events.map((ev, idx) =>
                    h('div', { key: idx, className: 'ml-6 relative group animate-in slide-in-from-left-2 fade-in duration-300' },
                        h('div', { className: 'absolute -left-[33px] w-6 h-6 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center text-xs text-neon-green shadow-neon-sm' },
                            getIcon(ev.type)
                        ),
                        h('div', { className: 'bg-zinc-950 p-4 rounded-lg border border-zinc-900 group-hover:border-zinc-700 transition-colors' },
                            h('h3', { className: 'text-white font-bold text-sm' }, ev.msg),
                            h('time', { className: 'text-xs text-gray-500 font-mono mt-1 block' }, ev.timeString)
                        )
                    )
                )
            )
    );
};
