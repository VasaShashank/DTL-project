import { h, cn } from '../utils/ui';
import { useState } from 'react';
import { useAuth } from '../context/auth-context';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export const LoginScreen = () => {
    const { login, signup, isSetup, isLoading } = useAuth();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isLoading) return h('div', { className: 'flex h-screen items-center justify-center text-neon-green' }, 'Initializing Secure Core...');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (isSetup) {
            const success = await login(password);
            if (!success) setError('Invalid Master Password');
        } else {
            if (password.length < 8) {
                setError('Password must be at least 8 characters');
                setLoading(false);
                return;
            }
            if (password !== confirm) {
                setError('Passwords do not match');
                setLoading(false);
                return;
            }
            await signup(password);
        }
        setLoading(false);
    };

    return h('div', { className: 'flex h-screen w-full items-center justify-center bg-black bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black' },
        h('div', { className: 'w-full max-w-md p-8 bg-zinc-950/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500' },
            h('div', { className: 'flex flex-col items-center mb-8' },
                h('div', { className: 'w-16 h-16 bg-neon-green rounded-2xl flex items-center justify-center text-black font-bold text-3xl mb-4 shadow-neon' }, 'V'),
                h('h1', { className: 'text-2xl font-bold text-white' }, isSetup ? 'Unlock Vault' : 'Create Vault'),
                h('p', { className: 'text-gray-400 text-sm mt-3 text-center leading-relaxed' },
                    isSetup
                        ? 'Enter your master password to decrypt your secure vault.'
                        : 'Set a strong master password. This key will be used to encrypt your data locally. Do not lose it.'
                )
            ),
            h('form', { onSubmit: handleSubmit, className: 'flex flex-col gap-5' },
                h(Input, {
                    type: 'password',
                    value: password,
                    onChange: setPassword,
                    placeholder: 'Master Password',
                    label: 'Master Password',
                    autoFocus: true
                }),
                !isSetup && h(Input, {
                    type: 'password',
                    value: confirm,
                    onChange: setConfirm,
                    placeholder: 'Confirm Password',
                    label: 'Confirm Password'
                }),
                error && h('div', { className: 'p-3 bg-red-900/20 border border-red-500/50 rounded text-red-500 text-sm' }, error),
                h(Button, { type: 'submit', className: 'w-full mt-2', disabled: loading },
                    loading ? 'Processing...' : (isSetup ? 'Unlock' : 'Create Vault')
                )
            ),
            h('div', { className: 'mt-8 text-center text-xs text-zinc-600' },
                'End-to-end encrypted. Zero knowledge. Client-side only.'
            )
        )
    );
};
