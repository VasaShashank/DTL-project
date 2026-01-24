import { createElement } from 'react';

export const h = createElement;
export const cn = (...classes) => classes.filter(Boolean).join(' ');
