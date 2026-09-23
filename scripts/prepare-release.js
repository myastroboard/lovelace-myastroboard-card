#!/usr/bin/env node
/*
 * Prepares a release: moves the CHANGELOG.md "Unreleased" entries into a
 * dated version section, resets the "Unreleased" template, and bumps
 * CARD_VERSION in dist/myastroboard-card.js to match.
 *
 * Usage: node scripts/prepare-release.js <X.Y.Z> [--dry-run]
 *
 * Does not touch git - review the diff, then commit, tag and push yourself:
 *   git add CHANGELOG.md dist/myastroboard-card.js
 *   git commit -m "Prepare vX.Y.Z release"
 *   git tag vX.Y.Z
 *   git push && git push --tags
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHANGELOG_PATH = path.join(ROOT, 'CHANGELOG.md');
const CARD_PATH = path.join(ROOT, 'dist', 'myastroboard-card.js');

const UNRELEASED_TEMPLATE =
  '### Features\n\n- None.\n\n### Fixes\n\n- None.\n\n### Breaking changes\n\n- None.\n\n';

function todayISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fail(message) {
  console.error(`prepare-release: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const version = args.find((a) => !a.startsWith('--'));

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  fail('usage: node scripts/prepare-release.js <X.Y.Z> [--dry-run]');
}

const changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');

const unreleasedRe = /^## Unreleased\n\n/m;
const unreleasedMatch = unreleasedRe.exec(changelog);
if (!unreleasedMatch) {
  fail('could not find a "## Unreleased" section in CHANGELOG.md');
}
const bodyStart = unreleasedMatch.index + unreleasedMatch[0].length;

const nextHeadingMatch = changelog.slice(bodyStart).match(/^## /m);
if (!nextHeadingMatch) {
  fail('could not find the next "## " version heading after Unreleased');
}
const bodyEnd = bodyStart + nextHeadingMatch.index;

const existingBody = changelog.slice(bodyStart, bodyEnd);
const hasRealEntries = existingBody.split('\n').some((line) => /^- (?!None\.$)\S/.test(line));
if (!hasRealEntries) {
  console.warn('prepare-release: warning - the Unreleased section has no entries yet (all "- None.")');
}

if (changelog.includes(`## ${version} `) || changelog.includes(`## ${version}\n`)) {
  fail(`CHANGELOG.md already has a "## ${version}" section`);
}

const newChangelog =
  changelog.slice(0, bodyStart) +
  UNRELEASED_TEMPLATE +
  `## ${version} (${todayISO()})\n\n` +
  existingBody +
  changelog.slice(bodyEnd);

const card = fs.readFileSync(CARD_PATH, 'utf8');
const versionRe = /const CARD_VERSION = '([^']+)';/;
const versionMatch = versionRe.exec(card);
if (!versionMatch) {
  fail(`could not find "const CARD_VERSION = '...'" in ${path.relative(ROOT, CARD_PATH)}`);
}
const oldVersion = versionMatch[1];
if (oldVersion === version) {
  fail(`CARD_VERSION is already ${version}`);
}
const newCard = card.replace(versionRe, `const CARD_VERSION = '${version}';`);

if (dryRun) {
  console.log(`[dry-run] would bump CARD_VERSION ${oldVersion} -> ${version}`);
  console.log(`[dry-run] would move Unreleased entries into "## ${version} (${todayISO()})"`);
  process.exit(0);
}

fs.writeFileSync(CHANGELOG_PATH, newChangelog);
fs.writeFileSync(CARD_PATH, newCard);

console.log(`Bumped CARD_VERSION ${oldVersion} -> ${version}`);
console.log(`Moved Unreleased entries into "## ${version} (${todayISO()})" in CHANGELOG.md`);
console.log('');
console.log('Review the diff, then:');
console.log('  git add CHANGELOG.md dist/myastroboard-card.js');
console.log(`  git commit -m "Prepare v${version} release"`);
console.log(`  git tag v${version}`);
console.log('  git push && git push --tags');
