import { h, cn } from '../utils/ui';
import { useState } from 'react';
import { useVault } from '../context/vault-context';
import { useGamification } from '../context/gamification-context'; // New
import { generateSecurityReport } from '../utils/ai-advisor';
import { getSmartTips, calculateEntropy, estimateCrackTime, explainWeakness, calculateRadarMetrics } from '../utils/security';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { StrengthMeter } from '../components/StrengthMeter';
import { HealthTimeline } from '../components/HealthTimeline';
import { RadarChart } from '../components/RadarChart';

export const AnalyzerScreen = () => {
    const { vaultItems, reuseMap, healthScore, timeline } = useVault();
    const { readiness } = useGamification();
    const [password, setPassword] = useState('');

    const analysis = analyzePassword(password);
    const tips = getSmartTips(healthScore, reuseMap, vaultItems);
    const radarMetrics = calculateRadarMetrics(vaultItems, reuseMap);

    const { percent, checklist, isReady } = readiness;


    const aiReport = generateSecurityReport(vaultItems, healthScore, reuseMap, timeline);

    return h('div', { className: 'max-w-4xl mx-auto flex flex-col gap-8' },
        h('div', {},
            h('h1', { className: 'text-3xl font-bold text-white mb-2' }, 'Security Analyzer'),
            h('p', { className: 'text-gray-400' }, 'Deep dive into your vault hygiene and password strength.')
        ),

        // AI Security Advisor
        h(Card, { className: 'p-6 bg-gradient-to-br from-zinc-900 to-black border-zinc-800 relative overflow-hidden' },
            h('div', { className: 'absolute top-0 right-0 p-4 opacity-10 pointer-events-none' },
                h('div', { className: 'text-9xl' }, '🤖')
            ),
            h('div', { className: 'flex items-start gap-4 relative z-10' },
                h('div', { className: 'w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center text-2xl border border-indigo-500/50 flex-shrink-0' }, '🤖'),
                h('div', { className: 'flex-1' },
                    h('h2', { className: 'text-lg font-bold text-white mb-2 flex items-center gap-2' },
                        'AI Security Advisor'
                    ),
                    h('p', { className: 'text-indigo-200 text-lg leading-relaxed font-light mb-6' }, `"${aiReport.riskSummary}"`),

                    aiReport.problems.length > 0 && h('div', { className: 'mb-6' },
                        h('h3', { className: 'text-xs font-bold text-gray-500 uppercase tracking-wider mb-3' }, 'Detected Issues'),
                        h('div', { className: 'grid gap-2' },
                            aiReport.problems.map((prob, i) =>
                                h('div', { key: i, className: 'flex items-center gap-3 bg-red-500/10 border border-red-500/20 p-2 rounded' },
                                    h('span', { className: 'text-red-400' }, '⚠️'),
                                    h('span', { className: 'text-red-200 text-sm' }, prob.text)
                                )
                            )
                        )
                    ),

                    aiReport.actions.length > 0 && h('div', {},
                        h('h3', { className: 'text-xs font-bold text-gray-500 uppercase tracking-wider mb-3' }, 'Recommended Actions'),
                        h('div', { className: 'grid gap-2' },
                            aiReport.actions.map((action, i) =>
                                h('div', { key: i, className: 'flex items-center gap-3 bg-neon-green/5 border border-neon-green/20 p-2 rounded' },
                                    h('span', { className: 'text-neon-green' }, '⚡'),
                                    h('span', { className: 'text-neon-green text-sm' }, action.text)
                                )
                            )
                        )
                    )
                )
            )
        ),


        // 0. Security Readiness
        h(Card, { className: 'p-6 bg-zinc-950/80 border-zinc-800' },
            h('div', { className: 'flex flex-col md:flex-row gap-6 items-center' },
                // Progress Circle / Badge
                h('div', { className: 'relative flex items-center justify-center flex-shrink-0' },
                    h('div', { className: cn('w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl font-bold shadow-lg', isReady ? 'border-neon-green text-neon-green shadow-neon-sm' : 'border-zinc-800 text-gray-500') },
                        `${percent}%`
                    ),
                    isReady && h('div', { className: 'absolute -bottom-2 px-2 py-0.5 bg-neon-green text-black text-[10px] font-bold rounded uppercase tracking-wider' }, 'Ready')
                ),

                // Checklist
                h('div', { className: 'flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3' },
                    checklist.map(item =>
                        h('div', { key: item.id, className: 'flex items-center gap-3 p-2 rounded bg-zinc-900/50 border border-zinc-800/50' },
                            h('div', { className: cn('w-5 h-5 rounded-full flex items-center justify-center text-xs border', item.met ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-zinc-800 border-zinc-700 text-gray-600') },
                                item.met ? '✓' : '✗'
                            ),
                            h('span', { className: cn('text-sm', item.met ? 'text-gray-200' : 'text-gray-500') }, item.label)
                        )
                    )
                )
            )
        ),

        // 1. Vault Overview Cards
        h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
            h(Card, { className: 'p-6 flex flex-col items-center justify-center bg-zinc-950/50' },
                h('div', { className: 'text-3xl font-bold text-white mb-1' }, vaultItems.length),
                h('div', { className: 'text-xs text-gray-500 uppercase tracking-widest' }, 'Total Passwords')
            ),
            h(Card, { className: 'p-6 flex flex-col items-center justify-center bg-zinc-950/50' },
                h('div', { className: cn('text-3xl font-bold mb-1', Object.keys(reuseMap).length > 0 ? 'text-red-500' : 'text-green-500') }, Object.keys(reuseMap).length),
                h('div', { className: 'text-xs text-gray-500 uppercase tracking-widest' }, 'Reused Passwords')
            ),
            h(Card, { className: 'p-6 flex flex-col items-center justify-center bg-zinc-950/50' },
                h('div', { className: cn('text-3xl font-bold mb-1', healthScore < 70 ? 'text-yellow-500' : 'text-neon-green') }, healthScore),
                h('div', { className: 'text-xs text-gray-500 uppercase tracking-widest' }, 'Health Score')
            )
        ),

        // 2. Security Radar
        h(Card, { className: 'p-6 bg-zinc-950/50' },
            h(RadarChart, { metrics: radarMetrics })
        ),

        // 3. Adaptive Tips
        h('div', { className: 'flex flex-col gap-4' },
            h('h2', { className: 'text-xl font-bold text-white' }, 'Suggested Actions'),
            tips.map((tip, idx) =>
                h(Card, {
                    key: idx, className: cn('border-l-4 p-4',
                        tip.type === 'danger' ? 'border-l-red-500 bg-red-900/10' :
                            tip.type === 'warning' ? 'border-l-yellow-500 bg-yellow-900/10' :
                                tip.type === 'info' ? 'border-l-blue-500 bg-blue-900/10' :
                                    'border-l-green-500 bg-green-900/10'
                    )
                },
                    h('h3', {
                        className: cn('font-bold text-sm',
                            tip.type === 'danger' ? 'text-red-400' :
                                tip.type === 'warning' ? 'text-yellow-400' :
                                    tip.type === 'info' ? 'text-blue-400' :
                                        'text-green-400'
                        )
                    }, tip.title),
                    h('p', { className: 'text-gray-400 text-sm mt-1' }, tip.msg)
                )
            )
        ),

        // 3. Health Timeline
        h(Card, { className: 'p-6 bg-zinc-950/50' },
            h(HealthTimeline, { timeline })
        ),

        // 4. Password Sandbox
        h(Card, { className: 'p-8 flex flex-col gap-6 bg-zinc-950/50 backdrop-blur mt-4' },
            h('h2', { className: 'text-xl font-bold text-white border-b border-zinc-800 pb-4' }, 'Password Lab'),
            h(Input, {
                label: 'Test Password',
                type: 'text',
                value: password,
                onChange: setPassword,
                placeholder: 'Type a password to analyze...',
                className: 'font-mono text-lg tracking-wide'
            }),

            password && h('div', { className: 'flex flex-col gap-6 animate-in fade-in slide-in-from-top-4' },
                h(StrengthMeter, { password }),

                // Weakness Explanations
                (() => {
                    const weaknesses = explainWeakness(password);
                    if (weaknesses.length === 0) return null;

                    return h('div', { className: 'flex flex-col gap-2' },
                        h('h3', { className: 'text-sm font-bold text-gray-400 uppercase tracking-wider' }, 'Security Warnings'),
                        weaknesses.map((w, idx) =>
                            h('div', {
                                key: idx,
                                className: cn(
                                    'p-3 rounded-lg border-l-4 text-sm flex items-start gap-3',
                                    w.severity === 'critical' ? 'bg-red-900/10 border-l-red-500 text-red-300' :
                                        w.severity === 'warning' ? 'bg-yellow-900/10 border-l-yellow-500 text-yellow-300' :
                                            'bg-blue-900/10 border-l-blue-500 text-blue-300'
                                )
                            },
                                h('span', { className: 'text-lg flex-shrink-0' },
                                    w.severity === 'critical' ? '⛔' : w.severity === 'warning' ? '⚠️' : 'ℹ️'
                                ),
                                h('span', {}, w.message)
                            )
                        )
                    );
                })(),

                h('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
                    h(Metric, { label: 'Length', value: password.length, good: password.length >= 12 }),
                    h(Metric, { label: 'Entropy', value: `${analysis.entropy}`, good: analysis.entropy > 60 }),
                    h(Metric, { label: 'Complexity', value: analysis.complexity, good: analysis.complexity === 'High' }),
                    h(Metric, { label: 'Crack Time', value: analysis.crackTime, good: analysis.crackTime.includes('Centuries') || analysis.crackTime.includes('Years') })
                ),
            )
        )
    );
};

const Metric = ({ label, value, good }) => {
    return h('div', { className: cn('bg-zinc-900 p-4 rounded-xl border flex flex-col items-center justify-center text-center', good ? 'border-green-900/50 bg-green-900/10' : 'border-red-900/50 bg-red-900/10') },
        h('div', { className: 'text-[10px] text-gray-500 uppercase tracking-wider mb-1 font-bold' }, label),
        h('div', { className: cn('text-lg font-bold', good ? 'text-green-500' : 'text-red-500') }, value)
    );
};

const analyzePassword = (pwd) => {
    if (!pwd) return { entropy: 0, complexity: 'None', crackTime: '0s' };

    const entropy = calculateEntropy(pwd);

    let complexity = 'Low';
    if (entropy > 35) complexity = 'Medium';
    if (entropy > 60) complexity = 'High';

    const crackTime = estimateCrackTime(entropy);

    return { entropy, complexity, crackTime };
};
