#!/usr/bin/env node
/*
 * Checks that every language in the card's TRANSLATIONS matches the English reference: same keys,
 * same {placeholder} names, and ASCII punctuation only (no curly quotes, en/em dashes, ellipsis
 * character or non-breaking space). Exits non-zero and lists every problem found.
 *
 * Usage: node scripts/validate-i18n.js
 */

const fs = require('fs');
const path = require('path');

const CARD_PATH = path.resolve(__dirname, '..', 'dist', 'myastroboard-card.js');
const REFERENCE = 'en';
const FORBIDDEN = {
  '\u2018': 'left single quote',
  '\u2019': 'curly apostrophe',
  '\u201c': 'left double quote',
  '\u201d': 'right double quote',
  '\u2013': 'en dash',
  '\u2014': 'em dash',
  '\u2026': 'ellipsis character',
  '\u00a0': 'non-breaking space',
};

function loadTranslations() {
  const source = fs.readFileSync(CARD_PATH, 'utf8');
  const marker = 'const TRANSLATIONS = ';
  const start = source.indexOf(marker);
  const end = source.indexOf('\n};', start);
  if (start < 0 || end < 0) {
    throw new Error(`could not find "${marker}{ ... };" in ${path.basename(CARD_PATH)}`);
  }
  // The block is a plain object literal: evaluate it on its own, without running the card.
  return new Function(`return ${source.slice(start + marker.length, end + 2)}`)();
}

function flatten(tree, prefix = '') {
  return Object.entries(tree).flatMap(([key, value]) =>
    value && typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [[`${prefix}${key}`, value]]
  );
}

function placeholders(value) {
  return JSON.stringify((String(value).match(/\{\w+\}/g) || []).sort());
}

const translations = loadTranslations();
const reference = new Map(flatten(translations[REFERENCE]));
const problems = [];

for (const [lang, tree] of Object.entries(translations)) {
  const leaves = new Map(flatten(tree));
  if (lang !== REFERENCE) {
    for (const key of reference.keys()) {
      if (!leaves.has(key)) problems.push(`${lang}: missing key ${key}`);
      else if (placeholders(leaves.get(key)) !== placeholders(reference.get(key))) {
        problems.push(`${lang}: ${key} placeholders differ from ${REFERENCE}`);
      }
    }
    for (const key of leaves.keys()) {
      if (!reference.has(key)) problems.push(`${lang}: unknown key ${key}`);
    }
  }
  for (const [key, value] of leaves) {
    for (const [char, name] of Object.entries(FORBIDDEN)) {
      if (String(value).includes(char)) problems.push(`${lang}: ${key} contains a forbidden character (${name})`);
    }
  }
}

problems.forEach((problem) => console.log(problem));
if (problems.length) {
  console.log(`${problems.length} problem(s) in TRANSLATIONS`);
  process.exit(1);
}
console.log(`TRANSLATIONS: all ${Object.keys(translations).length} languages match ${REFERENCE}`);
