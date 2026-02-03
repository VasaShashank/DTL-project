import { h, cn } from '../utils/ui';
import { useState } from 'react';
import { useVault } from '../context/vault-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { StrengthMeter } from '../components/StrengthMeter';
import { generateSecurityReport } from '../utils/security-advisor';
import { calculateEntropy, explainWeakness } from '../utils/security';

export const VaultScreen = () => {
    const { vaultItems, addPassword, deletePassword, reuseMap, timeline, healthScore } = useVault();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Add Password Form State
    const [newPass, setNewPass] = useState({ title: '', username: '', password: '', site: '' });

    const filteredItems = vaultItems.filter(item =>
        (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newPass.title || !newPass.password) return;

        await addPassword(newPass);
        setIsAddModalOpen(false);
        setNewPass({ title: '', username: '', password: '', site: '' });
    };

    return h('div', { className: 'flex flex-col gap-8' },
        // Header
        h('div', { className: 'flex flex-col md:flex-row md:justify-between md:items-center gap-4' },
            h('div', {},
                h('h1', { className: 'text-3xl font-bold text-white tracking-tight' }, 'Password Vault'),
                h('p', { className: 'text-gray-400 text-sm' }, `${vaultItems.length} secure items`)
            ),
            h('div', { className: 'flex gap-3 w-full md:w-auto' },
                h(Input, {
                    placeholder: 'Search vault...',
                    value: searchTerm,
                    onChange: setSearchTerm,
                    className: 'w-full md:w-64'
                }),
                h(Button, { onClick: () => setIsAddModalOpen(true), className: 'whitespace-nowrap' }, '+ Add Password')
            )
        ),

        // Quick Tip
        (() => {
            const adviceReport = generateSecurityReport(vaultItems, healthScore, reuseMap, timeline);
            const topAction = adviceReport.actions[0];
            if (!topAction) return null;

            return h(Card, { className: 'p-4 bg-indigo-900/10 border-indigo-500/20 flex items-center gap-4 mb-6' },
                h('div', { className: 'w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-xl' }, '🤖'),
                h('div', { className: 'flex-1' },
                    h('h3', { className: 'text-sm font-bold text-indigo-400 uppercase tracking-wider mb-0.5' }, 'Security Tip'),
                    h('p', { className: 'text-indigo-200 text-sm' }, topAction.text)
                )
            );
        })(),

        // Grid
        filteredItems.length === 0
            ? h('div', { className: 'flex flex-col items-center justify-center py-20 text-gray-500 border-2 border-dashed border-zinc-800 rounded-2xl' },
                h('span', { className: 'text-4xl mb-4' }, '🔒'),
                'Your vault is empty.'
            )
            : h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
                filteredItems.map(item => h(VaultItemCard, {
                    key: item.id,
                    item,
                    onDelete: deletePassword,
                    reuseCount: reuseMap[item.id]
                }))
            ),

        // Add Modal
        h(Modal, {
            isOpen: isAddModalOpen,
            onClose: () => setIsAddModalOpen(false),
            title: 'Add New Password'
        },
            h('form', { onSubmit: handleAdd, className: 'flex flex-col gap-5' },
                h(Input, {
                    label: 'Website / App Name',
                    value: newPass.title,
                    onChange: v => setNewPass({ ...newPass, title: v }),
                    autoFocus: true,
                    placeholder: 'e.g. Google'
                }),
                h(Input, {
                    label: 'Username',
                    value: newPass.username,
                    onChange: v => setNewPass({ ...newPass, username: v }),
                    placeholder: 'email@example.com'
                }),
                h(Input, {
                    label: 'Website URL',
                    value: newPass.site,
                    onChange: v => setNewPass({ ...newPass, site: v }),
                    placeholder: 'https://...'
                }),
                h('div', {},
                    h(Input, {
                        label: 'Password',
                        type: 'password',
                        value: newPass.password,
                        onChange: v => setNewPass({ ...newPass, password: v })
                    }),
                    h(StrengthMeter, { password: newPass.password }),

                    // Weakness Explanations
                    (() => {
                        const weaknesses = explainWeakness(newPass.password);
                        if (weaknesses.length === 0 || !newPass.password) return null;

                        return h('div', { className: 'mt-3 flex flex-col gap-2' },
                            weaknesses.slice(0, 3).map((w, idx) =>
                                h('div', {
                                    key: idx,
                                    className: cn(
                                        'p-2 rounded text-xs flex items-start gap-2 border-l-2',
                                        w.severity === 'critical' ? 'bg-red-900/10 border-l-red-500 text-red-300' :
                                            w.severity === 'warning' ? 'bg-yellow-900/10 border-l-yellow-500 text-yellow-300' :
                                                'bg-blue-900/10 border-l-blue-500 text-blue-300'
                                    )
                                },
                                    h('span', { className: 'flex-shrink-0' },
                                        w.severity === 'critical' ? '⛔' : w.severity === 'warning' ? '⚠️' : 'ℹ️'
                                    ),
                                    h('span', {}, w.message)
                                )
                            )
                        );
                    })()
                ),
                h('div', { className: 'flex justify-end gap-3 mt-6' },
                    h(Button, { variant: 'ghost', type: 'button', onClick: () => setIsAddModalOpen(false) }, 'Cancel'),
                    h(Button, { type: 'submit' }, 'Save Password')
                )
            )
        )
    );
};

const VaultItemCard = ({ item, onDelete, reuseCount }) => {
    const [revealed, setRevealed] = useState(false);
    const [copied, setCopied] = useState(false);

    const isWeak = calculateEntropy(item.password) < 45;
    const age = Date.now() - (item.updatedAt || item.createdAt);
    const isOld = age > (90 * 24 * 60 * 60 * 1000); // 90 days

    const handleCopy = () => {
        navigator.clipboard.writeText(item.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return h(Card, { className: 'flex flex-col gap-4 relative group hover:border-zinc-600' },
        h('div', { className: 'flex justify-between items-start' },
            h('div', { className: 'flex items-center gap-4' },
                h('div', { className: 'w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-xl font-bold text-white shadow-inner' },
                    (item.title || '?').charAt(0).toUpperCase()
                ),
                h('div', { className: 'overflow-hidden' },
                    h('h3', { className: 'font-bold text-white truncate w-32 md:w-36' }, item.title),
                    h('p', { className: 'text-xs text-gray-400 truncate w-32 md:w-36' }, item.username)
                )
            ),
            h(Button, {
                variant: 'icon',
                className: 'opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-500',
                onClick: (e) => { e.stopPropagation(); if (confirm('Delete this password?')) onDelete(item.id); }
            }, '🗑️')
        ),

        // Security Flags
        (reuseCount > 1 || isWeak || isOld) && h('div', { className: 'flex gap-2' },
            reuseCount > 1 && h('div', { className: 'px-2 py-0.5 bg-red-900/40 text-red-500 text-[10px] uppercase font-bold tracking-wider rounded border border-red-900/50' }, 'Reused'),
            isWeak && h('div', { className: 'px-2 py-0.5 bg-yellow-900/40 text-yellow-500 text-[10px] uppercase font-bold tracking-wider rounded border border-yellow-900/50' }, 'Weak'),
            isOld && h('div', { className: 'px-2 py-0.5 bg-blue-900/40 text-blue-500 text-[10px] uppercase font-bold tracking-wider rounded border border-blue-900/50' }, 'Old'),
        ),

        h('div', { className: 'bg-zinc-950 p-3 rounded-lg border border-zinc-900 flex justify-between items-center group/pass mt-auto' },
            h('span', { className: 'font-mono text-sm text-gray-300 truncate mr-2 select-text' },
                revealed ? item.password : '••••••••••••'
            ),
            h('div', { className: 'flex gap-1' },
                h(Button, {
                    variant: 'ghost',
                    className: 'p-1.5 h-auto text-xs hover:bg-zinc-800 rounded',
                    onClick: handleCopy
                }, copied ? '✓' : 'Copy'),
                h(Button, {
                    variant: 'ghost',
                    className: 'p-1.5 h-auto text-xs hover:bg-zinc-800 rounded',
                    onClick: () => setRevealed(!revealed)
                }, revealed ? 'Hide' : 'Show')
            )
        )
    );
};
