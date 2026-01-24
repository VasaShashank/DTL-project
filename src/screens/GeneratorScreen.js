import { h, cn } from '../utils/ui';
import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export const GeneratorScreen = () => {
    const [length, setLength] = useState(16);
    const [useSymbols, setUseSymbols] = useState(true);
    const [useNumbers, setUseNumbers] = useState(true);
    const [useUppercase, setUseUppercase] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generate = () => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const nums = '0123456789';
        const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let chars = lower;
        if (useUppercase) chars += upper;
        if (useNumbers) chars += nums;
        if (useSymbols) chars += syms;

        let res = '';
        for (let i = 0; i < length; i++) {
            res += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(res);
        setCopied(false);
    };

    useEffect(() => {
        generate();
    }, []);

    return h('div', { className: 'max-w-3xl mx-auto flex flex-col gap-10 mt-10' },
        h('div', { className: 'text-center' },
            h('h1', { className: 'text-3xl font-bold text-white mb-2' }, 'Generator'),
            h('p', { className: 'text-gray-400' }, 'Create strong, unpredictable passwords for your accounts.')
        ),

        h(Card, { className: 'flex flex-col gap-8 p-10 bg-zinc-950/50 backdrop-blur border-zinc-800' },
            h('div', { className: 'bg-black/50 p-8 rounded-2xl border border-zinc-800 text-center relative group' },
                h('div', { className: 'text-4xl font-mono text-neon-green break-all tracking-wider font-bold min-h-[48px]' }, password),
                h(Button, {
                    variant: 'ghost',
                    className: 'absolute top-4 right-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity',
                    onClick: () => { navigator.clipboard.writeText(password); setCopied(true); setTimeout(() => setCopied(false), 2000); }
                }, copied ? 'Copied!' : 'Copy')
            ),

            h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
                h('div', { className: 'col-span-full' },
                    h('div', { className: 'flex justify-between mb-3' },
                        h('label', { className: 'text-sm font-bold text-gray-300' }, 'Length'),
                        h('span', { className: 'text-neon-green font-mono text-xl font-bold' }, length)
                    ),
                    h('input', {
                        type: 'range',
                        min: 8,
                        max: 64,
                        value: length,
                        onChange: (e) => setLength(parseInt(e.target.value)),
                        className: 'w-full accent-neon-green h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer'
                    })
                ),
                h('div', { className: 'flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 hover:bg-zinc-900 transition-colors cursor-pointer', onClick: () => setUseNumbers(!useNumbers) },
                    h('label', { className: 'text-white font-medium cursor-pointer' }, '0-9 (Numbers)'),
                    h('input', { type: 'checkbox', checked: useNumbers, onChange: () => { }, className: 'accent-neon-green w-5 h-5 rounded cursor-pointer' })
                ),
                h('div', { className: 'flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 hover:bg-zinc-900 transition-colors cursor-pointer', onClick: () => setUseUppercase(!useUppercase) },
                    h('label', { className: 'text-white font-medium cursor-pointer' }, 'A-Z (Uppercase)'),
                    h('input', { type: 'checkbox', checked: useUppercase, onChange: () => { }, className: 'accent-neon-green w-5 h-5 rounded cursor-pointer' })
                ),
                h('div', { className: 'flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 hover:bg-zinc-900 transition-colors cursor-pointer', onClick: () => setUseSymbols(!useSymbols) },
                    h('label', { className: 'text-white font-medium cursor-pointer' }, '!@# (Symbols)'),
                    h('input', { type: 'checkbox', checked: useSymbols, onChange: () => { }, className: 'accent-neon-green w-5 h-5 rounded cursor-pointer' })
                )
            ),

            h(Button, { onClick: generate, className: 'py-4 text-lg mt-4 shadow-neon hover:shadow-neon-lg transition-shadow' }, 'Regenerate Password')
        )
    );
};
