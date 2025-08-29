import { readFileSync } from 'node:fs';
import path from 'node:path';

const load = (lng) => {
  const file = path.resolve('src/i18n/locales', lng, 'common.json');
  return JSON.parse(readFileSync(file, 'utf-8'));
};

function collect(obj, prefix = '', acc = []) {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const next = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object') {
      collect(val, next, acc);
    } else {
      acc.push(next);
    }
  }
  return acc;
}

const fr = load('fr');
const en = load('en');
const frKeys = collect(fr);
const enKeys = collect(en);
const missing = frKeys.filter(k => !enKeys.includes(k));
const extra = enKeys.filter(k => !frKeys.includes(k));
if (missing.length || extra.length) {
  console.error('Translation keys mismatch');
  if (missing.length) console.error('Missing in en:', missing.join(', '));
  if (extra.length) console.error('Missing in fr:', extra.join(', '));
  process.exit(1);
}
console.log('All translation keys match.');
