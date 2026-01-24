import { h, cn } from '../utils/ui';

export const Button = ({ children, onClick, variant = 'primary', className, ...props }) => {
    const variants = {
        primary: 'bg-neon-green text-black hover:bg-green-400 shadow-neon',
        secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
        danger: 'bg-red-600 text-white hover:bg-red-500',
        ghost: 'bg-transparent text-gray-400 hover:text-white',
        icon: 'p-2 bg-transparent text-gray-400 hover:text-white hover:bg-zinc-800 rounded-full'
    };

    return h('button', {
        className: cn(
            'px-4 py-2 rounded font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neon-green/50 disabled:opacity-50 disabled:cursor-not-allowed',
            variants[variant],
            className
        ),
        onClick,
        ...props
    }, children);
};
