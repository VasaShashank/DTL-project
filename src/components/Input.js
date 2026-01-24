import { h, cn } from '../utils/ui';

export const Input = ({ type = 'text', value, onChange, placeholder, className, label, error, ...props }) => {
    return h('div', { className: 'flex flex-col gap-1 w-full' },
        label && h('label', { className: 'text-xs text-gray-500 uppercase tracking-widest font-bold' }, label),
        h('input', {
            type,
            value,
            onChange: (e) => onChange(e.target.value),
            placeholder,
            className: cn(
                'bg-zinc-950 border border-zinc-800 rounded-md p-3 text-white placeholder-zinc-600 focus:border-neon-green focus:ring-1 focus:ring-neon-green focus:outline-none transition-all',
                error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
                className
            ),
            ...props
        }),
        error && h('span', { className: 'text-red-500 text-xs mt-1' }, error)
    );
};
