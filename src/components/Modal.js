import { h, cn } from '../utils/ui';
import { createPortal } from 'react-dom';

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return createPortal(
        h('div', { className: 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm' },
            h('div', { className: 'bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200' },
                h('div', { className: 'flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950/50' },
                    h('h2', { className: 'text-lg font-bold text-white' }, title),
                    h('button', {
                        onClick: onClose,
                        className: 'text-gray-400 hover:text-white transition-colors'
                    }, '✕')
                ),
                h('div', { className: 'p-6' }, children)
            )
        ),
        document.body
    );
};
