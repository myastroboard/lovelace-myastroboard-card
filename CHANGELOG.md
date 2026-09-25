# Changelog

## Unreleased

### Features

- None.

### Fixes

- None.

### Breaking changes

- None.

## 0.2.1 (2026-09-25)

### Features

- None.

### Fixes

- `diagnostic` mode: the hero's headline showed a raw "X min ago" reading that was almost always
  "0 min" (the heartbeat publishes about every minute when healthy), which was hard to parse at a
  glance, and the subtitle duplicated the header badge's label (e.g. "Update available") instead
  of showing the heartbeat's actual timing. The headline is now a plain connectivity read
  ("Online" / "Offline" / "Publish overdue", with a status dot) based on the heartbeat alone, and
  the subtitle shows the precise relative time instead.

### Breaking changes

- None.

## 0.2.0 (2026-09-25)

### Features

- New `diagnostic` mode (the board device): version and available update, cache readiness,
  SkyTonight scheduler state (calculating / last run / next run), and a publish heartbeat (last
  publish, locations and users published). The header badge and the heartbeat switch to the
  theme's error colour when the heartbeat is more than 5 minutes stale or the caches are not
  ready, and to the accent colour when an update is available. Six languages, like the other
  modes.

### Fixes

- The relative-time helper used across every mode ("in X min" / "X min ago") could show "in 0
  min" for something that had just happened, instead of "0 min ago" - a `Math.round()` of a
  small negative difference can yield `-0`, and `-0 >= 0` is `true` in JavaScript. Most visible
  on the new `diagnostic` mode's publish heartbeat, which is often only seconds old.

### Breaking changes

- None.

## 0.1.5 (2026-09-25)

### Features

- None.

### Fixes

- `tonight` mode: "Top targets"' object type (e.g. "Open Cluster", "Globular Cluster") was shown
  as the raw untranslated sensor value - added an object type translation table (46 entries) across
  all six languages, like the card already does for moon phase, dew risk and period.
- `tonight` mode: "Coming up"'s generic "Next event" row showed the raw English title for anything
  other than ISS/CSS passes (e.g. "Full Moon", solar/lunar eclipses, planetary conjunctions) - the
  title is now rebuilt client-side and translated from the event's type/eclipse-type/planet
  attributes when available, with new moon phase, eclipse type, planet and event title tables
  across all six languages. Falls back to the raw English title, unchanged, for event kinds that
  don't carry those attributes yet (meteor showers, comets, equinox/solstice) or on older
  MyAstroBoard versions that don't publish them.

### Breaking changes

- None.

## 0.1.4 (2026-09-25)

### Features

- None.

### Fixes

- `tonight` mode: the best-window moon condition (shown next to the hero score, e.g.
  "unfavorable") was displayed as the raw untranslated sensor state instead of going through the
  card's translation table like the other enum values (moon phase, dew risk, period).

### Breaking changes

- None.

## 0.1.3 (2026-09-25)

### Features

- None.

### Fixes

- `tonight` mode: "Dark window", "Dark until" and "Best window score" now sit on their own row of
  three columns instead of wrapping 2-then-1 depending on card width.

### Breaking changes

- None.

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
