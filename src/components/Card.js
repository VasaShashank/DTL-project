import { h, cn } from '../utils/ui';

export const Card = ({ children, className, onClick }) => {
    return h('div', {
        className: cn(
            'bg-card-bg border border-zinc-800 rounded-xl p-5 shadow-lg hover:shadow-xl hover:border-zinc-700 transition-all cursor-default',
            onClick && 'cursor-pointer active:scale-[0.99]',
            className
        ),
        onClick
    }, children);
};
