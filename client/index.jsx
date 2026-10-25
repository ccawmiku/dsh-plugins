import React from 'react';
import { SalonApp } from './app.jsx';

export const name = 'salon-client';
export const inject = ['slots'];
export function apply(ctx) {
  ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: 'salon' }, () => React.createElement(SalonApp)));
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: 'salon', order: 55, label: '四季沙龙' }, () => React.createElement('span', { style: { fontSize: 20, color: '#d9b2d7' } }, '✦')));
}
