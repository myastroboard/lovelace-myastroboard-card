# Changelog

## Unreleased

## 0.1.2 (2026-09-23)

### Features

- None.

### Fixes

- `tonight` mode: the hero gauge now shows the night score (`observation_score`, /10) instead of
  the best-window score (/100) - the best window can score low on a short or Moon-clipped window
  even on an excellent night, which made a great night look bad at a glance while the real night
  score sat unnoticed in the grid below. The best-window score is still shown, now as its own
  grid tile ("Best window score") instead of overlapping with the night score that used to be
  there.

### Breaking changes

- None.

## 0.1.1 (2026-09-22)

### Features

- `tonight` mode: added a "Next CSS pass" row under "Coming up", alongside "Next ISS pass" (six
  languages).

### Fixes

- `tonight` mode: stop showing the same ISS or CSS pass twice under "Coming up" (once as "Next
  event", once as the dedicated row, a few minutes apart since one is timestamped at peak and the
  other at rise) - the generic row is now skipped when it duplicates a dedicated row.

### Breaking changes

- None.

## 0.1.0 (2026-09-18)

- First release: `sky`, `tonight` and `activity` modes, visual editor with a device selector
  (MyAstroBoard devices from the registry, filtered by mode), six UI languages (en, fr, es, de,
  it, pt), bounded picture thumbnail (hidden / 160 / 240 / 400 px / natural), example dashboards and automations. Requires MyAstroBoard 1.6 (MQTT / Home Assistant
  connector).
