# Changelog

## Unreleased

### Features

- `tonight` mode: added a "Next CSS pass" row under "Coming up", alongside "Next ISS pass" (six
  languages).

### Fixes

- `tonight` mode: stop showing the same ISS or CSS pass twice under "Coming up" (once as "Next
  event", once as the dedicated row, a few minutes apart since one is timestamped at peak and the
  other at rise) - the generic row is now skipped when it duplicates a dedicated row.

### Breaking changes

- None.

### Notes

- Beta test in progress. Do not install in production.

## 0.1.0 (2026-09-18)

- First release: `sky`, `tonight` and `activity` modes, visual editor with a device selector
  (MyAstroBoard devices from the registry, filtered by mode), six UI languages (en, fr, es, de,
  it, pt), bounded picture thumbnail (hidden / 160 / 240 / 400 px / natural), example dashboards and automations. Requires MyAstroBoard 1.6 (MQTT / Home Assistant
  connector).
