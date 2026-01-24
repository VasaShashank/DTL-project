import { h } from '../utils/ui';
import { Button } from '../components/Button';

export const HomeScreen = ({ onEnterVault }) => {
    return h('div', { className: 'min-h-screen bg-black flex items-center justify-center p-8' },
        h('div', { className: 'max-w-4xl w-full' },
            // Header
            h('div', { className: 'text-center mb-12' },
                h('div', { className: 'w-20 h-20 bg-neon-green rounded-2xl flex items-center justify-center text-black font-bold text-3xl shadow-neon-lg mx-auto mb-6' }, 'P'),
                h('h1', { className: 'text-4xl font-bold text-white mb-2 tracking-tight' }, 'PassHygiene'),
                h('p', { className: 'text-gray-400 text-lg' }, 'Password Hygiene Tracker')
            ),

            // Academic Info Card
            h('div', { className: 'bg-zinc-950 border border-zinc-800 rounded-2xl p-8 mb-6' },
                h('div', { className: 'text-center mb-6 pb-6 border-b border-zinc-800' },
                    h('h2', { className: 'text-2xl font-bold text-neon-green mb-2' }, 'Design Thinking Lab (DTL) Project'),
                    h('p', { className: 'text-gray-400 text-sm' }, 'Semester-3'),
                    h('p', { className: 'text-gray-300 font-medium' }, 'RV College of Engineering')
                ),

                // Project Overview
                h('div', { className: 'mb-8' },
                    h('h3', { className: 'text-xl font-bold text-white mb-4' }, 'Project Overview'),
                    h('div', { className: 'text-gray-300 space-y-3 leading-relaxed' },
                        h('p', {}, 'PassHygiene is a client-side, zero-knowledge password hygiene tracker built entirely using React, Web Crypto API, and IndexedDB. With no backend or server infrastructure, all data remains encrypted locally on your device.'),
                        h('p', {}, 'The application focuses on:'),
                        h('ul', { className: 'list-disc list-inside space-y-2 ml-4 text-gray-400' },
                            h('li', {}, 'Secure password storage with AES-GCM encryption'),
                            h('li', {}, 'Password strength analysis and entropy calculation'),
                            h('li', {}, 'Reuse detection across accounts'),
                            h('li', {}, 'Vault health scoring and trend tracking'),
                            h('li', {}, 'Security analytics and visualization'),
                            h('li', {}, 'Gamification to encourage better security behavior')
                        ),
                        h('p', { className: 'text-gray-300' }, 'PassHygiene is designed to educate users about good password practices while protecting sensitive data through zero-knowledge encryption.')
                    )
                ),

                // Team Members
                h('div', { className: 'mb-8' },
                    h('h3', { className: 'text-xl font-bold text-white mb-4' }, 'Team Members'),
                    h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
                        [
                            { name: 'Vignesh Hariharan', usn: '1RV24CS317' },
                            { name: 'Vasa Shashank', usn: '1RV24CS312' },
                            { name: 'Venkata Sai Vijay Kuncham', usn: '1RV24CS314' },
                            { name: 'Suprit Raju Halingali', usn: '1RV24CS289' }
                        ].map(member =>
                            h('div', {
                                key: member.usn,
                                className: 'bg-zinc-900 border border-zinc-800 rounded-lg p-4'
                            },
                                h('p', { className: 'text-white font-medium' }, member.name),
                                h('p', { className: 'text-gray-500 text-sm font-mono' }, `USN: ${member.usn}`)
                            )
                        )
                    )
                ),

                // CTA Button
                h('div', { className: 'text-center pt-6 border-t border-zinc-800' },
                    h(Button, {
                        onClick: onEnterVault,
                        className: 'px-8 py-4 text-lg font-bold'
                    }, 'Enter Vault →')
                )
            ),

            // Footer
            h('div', { className: 'text-center text-gray-600 text-sm' },
                h('p', {}, 'End-to-end encrypted. Zero knowledge. Client-side only.')
            )
        )
    );
};
