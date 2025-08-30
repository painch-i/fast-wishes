import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

function collect(obj, prefix = '', acc = []) {
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const next = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      collect(val, next, acc);
    } else {
      acc.push(next);
    }
  }
  return acc;
}

const locales = ['fr', 'en'];
const localeDir = path.resolve('src/i18n/locales');
const localeKeys = {};
for (const lng of locales) {
  const file = path.join(localeDir, lng, 'common.json');
  const json = JSON.parse(readFileSync(file, 'utf-8'));
  localeKeys[lng] = new Set(collect(json));
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (['node_modules', '.yarn', 'dist'].includes(entry.name)) continue;
      walk(path.join(dir, entry.name), acc);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

const files = walk(path.resolve('src'));
const keyRegex = /\bt\(\s*["'`]([^"'`]+)["'`]/g;
const usedKeys = new Set();
for (const file of files) {
  const content = readFileSync(file, 'utf-8');
  for (const match of content.matchAll(keyRegex)) {
    if (!match[1].includes('${')) {
      usedKeys.add(match[1]);
    }
  }
}

const missing = [];
for (const key of usedKeys) {
  for (const lng of locales) {
    if (!localeKeys[lng].has(key)) {
      missing.push(`${key} (${lng})`);
    }
  }
}

if (missing.length) {
  console.error('Missing translations found:');
  for (const m of missing) console.error(`  - ${m}`);
  process.exit(1);
}

console.log('All used translations are present.');
