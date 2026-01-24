import { h } from '../utils/ui';
import { Card } from '../components/Card';

export const ThreatModelScreen = () => {
    return h('div', { className: 'max-w-4xl mx-auto flex flex-col gap-6' },
        h('div', {},
            h('h1', { className: 'text-3xl font-bold text-white mb-2' }, 'Threat Model & Security Architecture'),
            h('p', { className: 'text-gray-400' }, 'Understanding how your specific data is protected.')
        ),

        h(Card, { className: 'bg-zinc-950 border-zinc-900 p-6' },
            h('div', { className: 'flex items-center gap-2 mb-4' },
                h('div', { className: 'w-2 h-8 bg-neon-green rounded-full' }),
                h('h2', { className: 'text-xl font-bold text-white' }, 'Core Security Architecture')
            ),
            h('ul', { className: 'list-disc list-inside text-gray-300 space-y-3 pl-2' },
                h('li', {}, h('span', { className: 'font-bold text-white' }, 'Client-Side Encryption (E2EE):'), ' All data is encrypted on your device before saving using Web Crypto API. The server (if one existed) would only ever see encrypted blobs.'),
                h('li', {}, h('span', { className: 'font-bold text-white' }, 'Key Derivation:'), ' PBKDF2 with 100,000 iterations derives a 256-bit key from your master password and a random 16-byte salt.'),
                h('li', {}, h('span', { className: 'font-bold text-white' }, 'AES-256-GCM:'), ' Authenticated encryption ensures data cannot be modified without detection.'),
                h('li', {}, h('span', { className: 'font-bold text-white' }, 'Zero Knowledge:'), ' We do not store, see, or transmit your master password. If you lose it, your data is gone forever.')
            )
        ),

        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            h(Card, { className: 'bg-zinc-950 border-zinc-900 p-6' },
                h('h2', { className: 'text-xl font-bold text-green-500 mb-4 flex items-center gap-2' }, '🛡️ Protected Risks'),
                h('ul', { className: 'list-disc list-inside text-gray-300 space-y-2' },
                    h('li', {}, 'Database Leaks / Breaches'),
                    h('li', {}, 'Man-in-the-Middle Attacks'),
                    h('li', {}, 'Offline blob analysis'),
                    h('li', {}, 'Cross-Site Scripting (Content Security Policy assumed)')
                )
            ),
            h(Card, { className: 'bg-zinc-950 border-zinc-900 p-6' },
                h('h2', { className: 'text-xl font-bold text-red-500 mb-4 flex items-center gap-2' }, '⚠️ Threat Model Exclusions'),
                h('ul', { className: 'list-disc list-inside text-gray-300 space-y-2' },
                    h('li', {}, 'Compromised Device (Malware/Keyloggers)'),
                    h('li', {}, 'Weak Master Password (Brute Force)'),
                    h('li', {}, 'Physical Access to Unlocked Device'),
                    h('li', {}, 'Browser Extension Malice')
                )
            )
        ),

        h(Card, { className: 'bg-zinc-950 border-zinc-900 p-6' },
            h('h2', { className: 'text-xl font-bold text-white mb-4' }, 'Detailed Tech Specs'),
            h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 text-sm' },
                h('div', { className: 'flex justify-between border-b border-zinc-800 py-2' },
                    h('span', { className: 'text-gray-500' }, 'Algorithm'),
                    h('span', { className: 'font-mono text-neon-green' }, 'AES-GCM')
                ),
                h('div', { className: 'flex justify-between border-b border-zinc-800 py-2' },
                    h('span', { className: 'text-gray-500' }, 'Key Length'),
                    h('span', { className: 'font-mono text-neon-green' }, '256 bits')
                ),
                h('div', { className: 'flex justify-between border-b border-zinc-800 py-2' },
                    h('span', { className: 'text-gray-500' }, 'KDF'),
                    h('span', { className: 'font-mono text-neon-green' }, 'PBKDF2-SHA256')
                ),
                h('div', { className: 'flex justify-between border-b border-zinc-800 py-2' },
                    h('span', { className: 'text-gray-500' }, 'KDF Iterations'),
                    h('span', { className: 'font-mono text-neon-green' }, '100,000')
                ),
                h('div', { className: 'flex justify-between border-b border-zinc-800 py-2' },
                    h('span', { className: 'text-gray-500' }, 'IV/Nonce'),
                    h('span', { className: 'font-mono text-neon-green' }, '12 bytes (Random)')
                ),
                h('div', { className: 'flex justify-between border-b border-zinc-800 py-2' },
                    h('span', { className: 'text-gray-500' }, 'Storage'),
                    h('span', { className: 'font-mono text-neon-green' }, 'IndexedDB (Encrypted Blob)')
                )
            )
        )
    );
};
