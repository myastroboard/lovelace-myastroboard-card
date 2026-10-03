# MyAstroBoard card - instructions for AI coding agents

A Home Assistant Lovelace card (HACS plugin) showing the entities the
[MyAstroBoard](https://github.com/myastroboard/myastroboard) MQTT / Home Assistant connector
publishes, in four modes: `sky`, `tonight`, `activity` and `diagnostic`.

## Organization standards

The rules shared by every MyAstroBoard repository live in the synced file below. They apply here
in full, except where "Relaxed here" says otherwise; this file only adds what is specific to the
card. Do not edit the synced copy: change it in
[myastroboard/.github](https://github.com/myastroboard/.github/tree/main/standards).

@.github/instructions/org-standards.instructions.md

### Relaxed here

- **Logging** (standards section 4): there is no backend. The only console output is the
  `console.info` version banner printed once at load, the Home Assistant custom card convention.
  Nothing else is logged.
- **Python tooling** (standards section 13): no Python in this repository.

## Hard rules

- **One file, no build, no dependencies.** `dist/myastroboard-card.js` *is* the source: no Lit,
  no bundler, no npm package, no CDN. HACS serves that file as-is (`hacs.json` points at it).
- **The entities are a cross-repository contract.** The card finds entities by the domain + suffix
  in `ENTITIES`, which Home Assistant derives from the entity *names* the board's connector declares
  (`myastroboard/backend/connectors/mqtt_payloads.py`, documented in the board's
  `docs/HOME_ASSISTANT.md`). A renamed entity on the board side breaks the card silently: check
  both sides, and follow the cross-repository contract rule of the organization standards.
- **Home Assistant theme variables only.** Colors come from `var(--primary-text-color)`,
  `var(--secondary-text-color)`, `var(--divider-color)`, ... so the card follows every light and
  dark theme. A raw color needs a theme-variable fallback chain.
- **Static styles live in the CSS blocks**: `STYLES` for the card, `EDITOR_STYLES` for the visual
  editor, each injected into its shadow root. Inline `.style` writes are only for computed values
  (gauge widths, the `--mab-picture-height` custom property).

## Translations

- Labels live in `TRANSLATIONS` in the card file: en, fr, es, de, it, pt; the Home Assistant UI
  language picks the set and `en` is the fallback. Every language carries the same keys and
  `{placeholder}` names as `en`, with ASCII punctuation only: `node scripts/validate-i18n.js`
  checks it, and CI runs it.

## Checks before calling a change done

```bash
# Same checks as CI
node -e "new Function(require('fs').readFileSync('dist/myastroboard-card.js','utf8')); console.log('syntax ok')"
node scripts/validate-i18n.js
```

- CI also runs the HACS validation (`.github/workflows/validate.yml`).
- **Test in a real Home Assistant dashboard** (the pull request template asks for the version and
  browser): every touched mode, the visual editor, light and dark theme, and phone width.

## Releasing

`node scripts/prepare-release.js X.Y.Z` moves the `## [Unreleased]` entries into `## X.Y.Z (date)`
and bumps `CARD_VERSION`; add `--dry-run` to preview. The maintainer then commits, tags `vX.Y.Z`
and pushes; `.github/workflows/release.yml` builds the GitHub release notes from that changelog
section.
