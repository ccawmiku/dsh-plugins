import React from 'react';
import { createRoot } from 'react-dom/client';
import { SalonApp } from './app.jsx';
const demo = await fetch('/preview-mode').then(r => r.json()).then(r => r.demo);
document.documentElement.style.height = '100%';
document.body.style.height = '100%';
document.getElementById('root').style.height = '100%';
createRoot(document.getElementById('root')).render(<SalonApp demo={demo} />);
