import { h, cn } from '../utils/ui';
import { calculateEffectiveEntropy, estimateCrackTime } from '../utils/security';

export const StrengthMeter = ({ password }) => {
    const entropy = calculateEffectiveEntropy(password);

    // Entropy tiers for visuals (adjusted for realistic strength)
    let score = 0;
    if (entropy > 0) score = 1;
    if (entropy >= 40) score = 2; // Fair
    if (entropy >= 50) score = 3; // Good
    if (entropy >= 65) score = 4; // Strong
    if (entropy >= 80) score = 5; // Excellent

    const colors = [
        'bg-zinc-800',
        'bg-red-600',
        'bg-orange-500',
        'bg-yellow-400',
        'bg-green-500',
        'bg-neon-green'
    ];

    const label = ['None', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const timeToCrack = estimateCrackTime(entropy);

    return h('div', { className: 'flex flex-col gap-2 mt-2' },
        h('div', { className: 'flex gap-1 h-1.5 w-full' },
            [1, 2, 3, 4, 5].map(step =>
                h('div', {
                    key: step,
                    className: cn(
                        'flex-1 rounded-full transition-colors duration-300',
                        step <= score ? colors[score] : 'bg-zinc-800'
                    )
                })
            )
        ),
        password && h('div', { className: 'flex justify-between items-center text-xs' },
            h('div', { className: 'flex gap-2' },
                h('span', { className: 'text-gray-400' }, 'Strength'),
                h('span', { className: cn('font-bold', score >= 4 ? 'text-neon-green' : 'text-gray-300') }, label[score])
            ),
            h('span', { className: 'text-gray-500' },
                entropy > 0 ? `${Math.floor(entropy)} bits (~${timeToCrack})` : ''
            )
        )
    );
};
