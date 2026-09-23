/*
 * MyAstroBoard card for Home Assistant
 * https://github.com/myastroboard/lovelace-myastroboard-card
 *
 * Shows the entities the MyAstroBoard MQTT / Home Assistant connector publishes
 * (https://github.com/myastroboard/myastroboard/blob/main/docs/HOME_ASSISTANT.md) in three
 * modes: "sky" (conditions now), "tonight" (windows, top target, next event) and "activity"
 * (a user's Astrodex, plan and log). Dependency-free: no Lit bundle, no CDN, one file.
 *
 * Entities are resolved from the Home Assistant device registry (config `device`), or from an
 * entity id prefix (config `entity_prefix`) for hand-written YAML. Labels follow the Home
 * Assistant UI language (en, fr, es, de, it, pt).
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

const CARD_VERSION = '0.1.1';
const CARD_TYPE = 'myastroboard-card';
const MANUFACTURER = 'MyAstroBoard';
const MODEL_BY_MODE = { sky: 'Location', tonight: 'Location', activity: 'User' };

// Entity object ids as Home Assistant derives them from the device name + the entity name the
// connector declares ("MyAstroBoard - Backyard" + "Top target tonight" ->
// sensor.myastroboard_backyard_top_target_tonight). The card only needs the domain + suffix.
const ENTITIES = {
    sky: {
        period:       ['sensor', 'sky_period'],
        nextPeriod:   ['sensor', 'next_sky_period'],
        nextPeriodAt: ['sensor', 'next_sky_period_at'],
        night:        ['binary_sensor', 'astronomical_night'],
        score:        ['sensor', 'observation_score'],
        sunset:       ['sensor', 'sunset'],
        sunrise:      ['sensor', 'sunrise'],
        astroDusk:    ['sensor', 'astronomical_dusk'],
        astroDawn:    ['sensor', 'astronomical_dawn'],
        moonPhase:    ['sensor', 'moon_phase'],
        moonIllum:    ['sensor', 'moon_illumination'],
        moonrise:     ['sensor', 'next_moonrise'],
        moonset:      ['sensor', 'next_moonset'],
        temperature:  ['sensor', 'temperature'],
        clouds:       ['sensor', 'cloud_cover'],
        humidity:     ['sensor', 'humidity'],
        wind:         ['sensor', 'wind_speed'],
        seeing:       ['sensor', 'seeing'],
        transparency: ['sensor', 'transparency'],
        dew:          ['sensor', 'dew_risk'],
    },
    tonight: {
        bestStart:    ['sensor', 'best_window_start'],
        bestEnd:      ['sensor', 'best_window_end'],
        bestScore:    ['sensor', 'best_window_score'],
        bestDuration: ['sensor', 'best_window_duration'],
        bestMoon:     ['sensor', 'best_window_moon_condition'],
        darkStart:    ['sensor', 'dark_window_start'],
        darkEnd:      ['sensor', 'dark_window_end'],
        nightStart:   ['sensor', 'skytonight_night_start'],
        nightEnd:     ['sensor', 'skytonight_night_end'],
        topTarget:    ['sensor', 'top_target_tonight'],
        topScore:     ['sensor', 'top_target_astroscore'],
        nextEvent:    ['sensor', 'next_event'],
        nextEventAt:  ['sensor', 'next_event_at'],
        nextIss:      ['sensor', 'next_iss_pass'],
        nextCss:      ['sensor', 'next_css_pass'],
        score:        ['sensor', 'observation_score'],
    },
    activity: {
        objects:        ['sensor', 'astrodex_objects'],
        pictures:       ['sensor', 'astrodex_pictures'],
        constellations: ['sensor', 'astrodex_constellations'],
        lastObject:     ['sensor', 'last_astrodex_picture_object'],
        lastAt:         ['sensor', 'last_astrodex_picture'],
        planState:      ['sensor', 'plan_state'],
        planActive:     ['binary_sensor', 'plan_in_progress'],
        planProgress:   ['sensor', 'plan_progress'],
        planCurrent:    ['sensor', 'plan_current_target'],
        planNext:       ['sensor', 'plan_next_target'],
        planTotal:      ['sensor', 'plan_targets'],
        planDone:       ['sensor', 'plan_targets_done'],
        planStart:      ['sensor', 'plan_night_start'],
        planEnd:        ['sensor', 'plan_night_end'],
        equipment:      ['sensor', 'active_equipment'],
        sessions:       ['sensor', 'observation_sessions'],
        integration:    ['sensor', 'total_integration'],
        lastSession:    ['sensor', 'last_observation_session'],
        picture:        ['image', 'latest_astrodex_picture'],
    },
};

// ---------------------------------------------------------------------------
// Translations - the Home Assistant UI language picks the set, English is the fallback
// ---------------------------------------------------------------------------

const TRANSLATIONS = {
    en: {
        sky_now: 'Sky now', tonight: 'Tonight', activity: 'Activity',
        night_score: 'Night score', best_window: 'Best window', best_window_score: 'Best window score', hours_short: 'h',
        sunset: 'Sunset', astro_dusk: 'Astro dusk', astro_dawn: 'Astro dawn', sunrise: 'Sunrise',
        moon: 'Moon', illumination: 'Illumination', moonrise: 'Moonrise', moonset: 'Moonset',
        weather: 'Weather', clouds: 'Clouds', temperature: 'Temperature', humidity: 'Humidity', wind: 'Wind',
        seeing: 'Seeing', transparency: 'Transparency', dew_risk: 'Dew risk',
        night_starts: 'Night starts', night_ends: 'Night ends', dark_window: 'Dark window', dark_until: 'Dark until',
        top_targets: 'Top targets', score: 'score', coming_up: 'Coming up', next_iss_pass: 'Next ISS pass',
        next_css_pass: 'Next CSS pass',
        objects: 'Objects', pictures: 'Pictures', constellations: 'Constellations', sessions: 'Sessions',
        integration: 'Integration', last_session: 'Last session', plan_my_night: 'Plan My Night',
        no_plan: 'No plan tonight', targets_done: 'targets done', now: 'Now', next: 'Next', equipment: 'Equipment',
        plan_in_progress: 'Plan in progress', plan: 'Plan', latest_picture: 'Latest Astrodex picture',
        waiting: 'Waiting for Home Assistant...',
        no_entities: 'No MyAstroBoard entities found. Pick a device in the card editor, or check the entity prefix and that the MQTT connector module is enabled.',
        in: 'in', ago: 'ago',
        period: { day: 'Day', civil_twilight: 'Civil twilight', nautical_twilight: 'Nautical twilight',
                  astronomical_twilight: 'Astronomical twilight', astronomical_night: 'Astronomical night', unknown: 'Unknown' },
        moon_phase: { 'New Moon': 'New Moon', 'Waxing Crescent': 'Waxing crescent', 'First Quarter': 'First quarter',
                      'Waxing Gibbous': 'Waxing gibbous', 'Full Moon': 'Full Moon', 'Waning Gibbous': 'Waning gibbous',
                      'Last Quarter': 'Last quarter', 'Waning Crescent': 'Waning crescent' },
        dew: { LOW: 'Low', MODERATE: 'Moderate', HIGH: 'High', CRITICAL: 'Critical', UNKNOWN: 'Unknown' },
        plan_state: { none: 'none', current: 'current', previous: 'previous' },
        editor: { mode: 'Mode', device: 'Device', title: 'Title', title_ph: 'Optional title', icon: 'Icon',
                  mode_sky: 'Sky now (a location)', mode_tonight: 'Tonight (a location)', mode_activity: 'Activity (a user)',
                  no_devices: 'No MyAstroBoard {model} device found. Enable the matching module in MyAstroBoard (Parameters > Connectors > MQTT); a user device also needs that user to opt in under My settings > Customize.',
                  device_help: 'MyAstroBoard devices from Settings > Devices & services > MQTT.',
                  prefix: 'Entity prefix', prefix_help: 'Fallback when no device is found: the part of the entity ids before the entity name, e.g. myastroboard_backyard.',
                  picture: 'Latest picture', picture_hidden: 'Hidden', picture_small: 'Small thumbnail (160 px)', picture_medium: 'Thumbnail (240 px)', picture_large: 'Large (400 px)', picture_full: 'Natural size', picture_help: 'The thumbnail is cropped to the card width; click it to open the full picture.',
                  model_location: 'location', model_user: 'user' },
    },
    fr: {
        sky_now: 'Ciel actuel', tonight: 'Cette nuit', activity: 'Activité',
        night_score: 'Score de la nuit', best_window: 'Meilleure fenêtre', best_window_score: 'Score de la fenêtre', hours_short: 'h',
        sunset: 'Coucher du Soleil', astro_dusk: 'Crépuscule astro', astro_dawn: 'Aube astro', sunrise: 'Lever du Soleil',
        moon: 'Lune', illumination: 'Illumination', moonrise: 'Lever de Lune', moonset: 'Coucher de Lune',
        weather: 'Météo', clouds: 'Nuages', temperature: 'Température', humidity: 'Humidité', wind: 'Vent',
        seeing: 'Seeing', transparency: 'Transparence', dew_risk: 'Risque de rosée',
        night_starts: 'Début de nuit', night_ends: 'Fin de nuit', dark_window: 'Fenêtre de noirceur', dark_until: "Noir jusqu'à",
        top_targets: 'Meilleures cibles', score: 'score', coming_up: 'À venir', next_iss_pass: 'Prochain passage ISS',
        next_css_pass: 'Prochain passage CSS',
        objects: 'Objets', pictures: 'Photos', constellations: 'Constellations', sessions: 'Sessions',
        integration: 'Intégration', last_session: 'Dernière session', plan_my_night: 'Plan My Night',
        no_plan: 'Pas de plan cette nuit', targets_done: 'cibles faites', now: 'En cours', next: 'Suivante', equipment: 'Matériel',
        plan_in_progress: 'Plan en cours', plan: 'Plan', latest_picture: 'Dernière photo Astrodex',
        waiting: 'En attente de Home Assistant...',
        no_entities: "Aucune entité MyAstroBoard trouvée. Choisissez un appareil dans l'éditeur de carte, ou vérifiez le préfixe d'entité et que le module du connecteur MQTT est activé.",
        in: 'dans', ago: 'il y a',
        period: { day: 'Jour', civil_twilight: 'Crépuscule civil', nautical_twilight: 'Crépuscule nautique',
                  astronomical_twilight: 'Crépuscule astronomique', astronomical_night: 'Nuit astronomique', unknown: 'Inconnu' },
        moon_phase: { 'New Moon': 'Nouvelle Lune', 'Waxing Crescent': 'Premier croissant', 'First Quarter': 'Premier quartier',
                      'Waxing Gibbous': 'Gibbeuse croissante', 'Full Moon': 'Pleine Lune', 'Waning Gibbous': 'Gibbeuse décroissante',
                      'Last Quarter': 'Dernier quartier', 'Waning Crescent': 'Dernier croissant' },
        dew: { LOW: 'Faible', MODERATE: 'Modéré', HIGH: 'Élevé', CRITICAL: 'Critique', UNKNOWN: 'Inconnu' },
        plan_state: { none: 'aucun', current: 'en cours', previous: 'passé' },
        editor: { mode: 'Mode', device: 'Appareil', title: 'Titre', title_ph: 'Titre optionnel', icon: 'Icône',
                  mode_sky: 'Ciel actuel (un lieu)', mode_tonight: 'Cette nuit (un lieu)', mode_activity: 'Activité (un utilisateur)',
                  no_devices: "Aucun appareil MyAstroBoard de type {model} trouvé. Activez le module correspondant dans MyAstroBoard (Paramètres > Connecteurs > MQTT) ; un appareil utilisateur nécessite aussi que l'utilisateur active la publication dans Mes paramètres > Personnaliser.",
                  device_help: 'Appareils MyAstroBoard de Paramètres > Appareils et services > MQTT.',
                  prefix: "Préfixe d'entité", prefix_help: "Solution de repli sans appareil détecté : la partie des identifiants d'entité avant le nom, ex. myastroboard_jardin.",
                  picture: 'Dernière photo', picture_hidden: 'Masquée', picture_small: 'Petite vignette (160 px)', picture_medium: 'Vignette (240 px)', picture_large: 'Grande (400 px)', picture_full: 'Taille réelle', picture_help: 'La vignette est recadrée à la largeur de la carte ; un clic ouvre la photo complète.',
                  model_location: 'lieu', model_user: 'utilisateur' },
    },
    es: {
        sky_now: 'Cielo ahora', tonight: 'Esta noche', activity: 'Actividad',
        night_score: 'Puntuación de la noche', best_window: 'Mejor ventana', best_window_score: 'Puntuación de la ventana', hours_short: 'h',
        sunset: 'Puesta de Sol', astro_dusk: 'Crepúsculo astro', astro_dawn: 'Amanecer astro', sunrise: 'Salida del Sol',
        moon: 'Luna', illumination: 'Iluminación', moonrise: 'Salida de la Luna', moonset: 'Puesta de la Luna',
        weather: 'Tiempo', clouds: 'Nubes', temperature: 'Temperatura', humidity: 'Humedad', wind: 'Viento',
        seeing: 'Seeing', transparency: 'Transparencia', dew_risk: 'Riesgo de rocío',
        night_starts: 'Inicio de la noche', night_ends: 'Fin de la noche', dark_window: 'Ventana de oscuridad', dark_until: 'Oscuro hasta',
        top_targets: 'Mejores objetivos', score: 'puntuación', coming_up: 'Próximamente', next_iss_pass: 'Próximo paso de la ISS',
        next_css_pass: 'Próximo paso de la CSS',
        objects: 'Objetos', pictures: 'Fotos', constellations: 'Constelaciones', sessions: 'Sesiones',
        integration: 'Integración', last_session: 'Última sesión', plan_my_night: 'Plan My Night',
        no_plan: 'Sin plan esta noche', targets_done: 'objetivos hechos', now: 'Ahora', next: 'Siguiente', equipment: 'Equipo',
        plan_in_progress: 'Plan en curso', plan: 'Plan', latest_picture: 'Última foto de Astrodex',
        waiting: 'Esperando a Home Assistant...',
        no_entities: 'No se encontraron entidades MyAstroBoard. Elige un dispositivo en el editor de la tarjeta, o comprueba el prefijo de entidad y que el módulo del conector MQTT esté activado.',
        in: 'en', ago: 'hace',
        period: { day: 'Día', civil_twilight: 'Crepúsculo civil', nautical_twilight: 'Crepúsculo náutico',
                  astronomical_twilight: 'Crepúsculo astronómico', astronomical_night: 'Noche astronómica', unknown: 'Desconocido' },
        moon_phase: { 'New Moon': 'Luna nueva', 'Waxing Crescent': 'Luna creciente', 'First Quarter': 'Cuarto creciente',
                      'Waxing Gibbous': 'Gibosa creciente', 'Full Moon': 'Luna llena', 'Waning Gibbous': 'Gibosa menguante',
                      'Last Quarter': 'Cuarto menguante', 'Waning Crescent': 'Luna menguante' },
        dew: { LOW: 'Bajo', MODERATE: 'Moderado', HIGH: 'Alto', CRITICAL: 'Crítico', UNKNOWN: 'Desconocido' },
        plan_state: { none: 'ninguno', current: 'en curso', previous: 'anterior' },
        editor: { mode: 'Modo', device: 'Dispositivo', title: 'Título', title_ph: 'Título opcional', icon: 'Icono',
                  mode_sky: 'Cielo ahora (una ubicación)', mode_tonight: 'Esta noche (una ubicación)', mode_activity: 'Actividad (un usuario)',
                  no_devices: 'No se encontró ningún dispositivo MyAstroBoard de tipo {model}. Activa el módulo correspondiente en MyAstroBoard (Parámetros > Conectores > MQTT); un dispositivo de usuario también requiere que ese usuario active la publicación en Mi configuración > Personalizar.',
                  device_help: 'Dispositivos MyAstroBoard de Ajustes > Dispositivos y servicios > MQTT.',
                  prefix: 'Prefijo de entidad', prefix_help: 'Alternativa si no se detecta ningún dispositivo: la parte de los ids de entidad antes del nombre, p. ej. myastroboard_jardin.',
                  picture: 'Última foto', picture_hidden: 'Oculta', picture_small: 'Miniatura pequeña (160 px)', picture_medium: 'Miniatura (240 px)', picture_large: 'Grande (400 px)', picture_full: 'Tamaño real', picture_help: 'La miniatura se recorta al ancho de la tarjeta; un clic abre la foto completa.',
                  model_location: 'ubicación', model_user: 'usuario' },
    },
    de: {
        sky_now: 'Himmel jetzt', tonight: 'Heute Nacht', activity: 'Aktivität',
        night_score: 'Nacht-Score', best_window: 'Bestes Fenster', best_window_score: 'Fenster-Score', hours_short: 'h',
        sunset: 'Sonnenuntergang', astro_dusk: 'Astro-Dämmerung', astro_dawn: 'Astro-Morgen', sunrise: 'Sonnenaufgang',
        moon: 'Mond', illumination: 'Beleuchtung', moonrise: 'Mondaufgang', moonset: 'Monduntergang',
        weather: 'Wetter', clouds: 'Wolken', temperature: 'Temperatur', humidity: 'Luftfeuchte', wind: 'Wind',
        seeing: 'Seeing', transparency: 'Transparenz', dew_risk: 'Taurisiko',
        night_starts: 'Nachtbeginn', night_ends: 'Nachtende', dark_window: 'Dunkelfenster', dark_until: 'Dunkel bis',
        top_targets: 'Beste Ziele', score: 'Score', coming_up: 'Demnächst', next_iss_pass: 'Nächster ISS-Überflug',
        next_css_pass: 'Nächster CSS-Überflug',
        objects: 'Objekte', pictures: 'Fotos', constellations: 'Sternbilder', sessions: 'Sitzungen',
        integration: 'Belichtung', last_session: 'Letzte Sitzung', plan_my_night: 'Plan My Night',
        no_plan: 'Kein Plan heute Nacht', targets_done: 'Ziele erledigt', now: 'Jetzt', next: 'Nächstes', equipment: 'Ausrüstung',
        plan_in_progress: 'Plan läuft', plan: 'Plan', latest_picture: 'Neuestes Astrodex-Foto',
        waiting: 'Warte auf Home Assistant...',
        no_entities: 'Keine MyAstroBoard-Entitäten gefunden. Wähle im Karteneditor ein Gerät, oder prüfe das Entitätspräfix und ob das Modul des MQTT-Connectors aktiviert ist.',
        in: 'in', ago: 'vor',
        period: { day: 'Tag', civil_twilight: 'Bürgerliche Dämmerung', nautical_twilight: 'Nautische Dämmerung',
                  astronomical_twilight: 'Astronomische Dämmerung', astronomical_night: 'Astronomische Nacht', unknown: 'Unbekannt' },
        moon_phase: { 'New Moon': 'Neumond', 'Waxing Crescent': 'Zunehmende Sichel', 'First Quarter': 'Erstes Viertel',
                      'Waxing Gibbous': 'Zunehmender Mond', 'Full Moon': 'Vollmond', 'Waning Gibbous': 'Abnehmender Mond',
                      'Last Quarter': 'Letztes Viertel', 'Waning Crescent': 'Abnehmende Sichel' },
        dew: { LOW: 'Gering', MODERATE: 'Mäßig', HIGH: 'Hoch', CRITICAL: 'Kritisch', UNKNOWN: 'Unbekannt' },
        plan_state: { none: 'keiner', current: 'aktuell', previous: 'vergangen' },
        editor: { mode: 'Modus', device: 'Gerät', title: 'Titel', title_ph: 'Optionaler Titel', icon: 'Symbol',
                  mode_sky: 'Himmel jetzt (ein Standort)', mode_tonight: 'Heute Nacht (ein Standort)', mode_activity: 'Aktivität (ein Benutzer)',
                  no_devices: 'Kein MyAstroBoard-Gerät vom Typ {model} gefunden. Aktiviere das passende Modul in MyAstroBoard (Parameter > Connectors > MQTT); ein Benutzergerät erfordert zusätzlich, dass der Benutzer unter Meine Einstellungen > Anpassen zustimmt.',
                  device_help: 'MyAstroBoard-Geräte aus Einstellungen > Geräte & Dienste > MQTT.',
                  prefix: 'Entitätspräfix', prefix_help: 'Ersatz, wenn kein Gerät gefunden wird: der Teil der Entitäts-IDs vor dem Namen, z. B. myastroboard_garten.',
                  picture: 'Neuestes Foto', picture_hidden: 'Ausgeblendet', picture_small: 'Kleine Vorschau (160 px)', picture_medium: 'Vorschau (240 px)', picture_large: 'Groß (400 px)', picture_full: 'Originalgröße', picture_help: 'Die Vorschau wird auf die Kartenbreite zugeschnitten; ein Klick öffnet das ganze Foto.',
                  model_location: 'Standort', model_user: 'Benutzer' },
    },
    it: {
        sky_now: 'Cielo ora', tonight: 'Stanotte', activity: 'Attività',
        night_score: 'Punteggio della notte', best_window: 'Finestra migliore', best_window_score: 'Punteggio della finestra', hours_short: 'h',
        sunset: 'Tramonto', astro_dusk: 'Crepuscolo astro', astro_dawn: 'Alba astro', sunrise: 'Alba',
        moon: 'Luna', illumination: 'Illuminazione', moonrise: 'Sorgere della Luna', moonset: 'Tramonto della Luna',
        weather: 'Meteo', clouds: 'Nuvole', temperature: 'Temperatura', humidity: 'Umidità', wind: 'Vento',
        seeing: 'Seeing', transparency: 'Trasparenza', dew_risk: 'Rischio di rugiada',
        night_starts: 'Inizio notte', night_ends: 'Fine notte', dark_window: 'Finestra di buio', dark_until: 'Buio fino a',
        top_targets: 'Obiettivi migliori', score: 'punteggio', coming_up: 'In arrivo', next_iss_pass: 'Prossimo passaggio ISS',
        next_css_pass: 'Prossimo passaggio CSS',
        objects: 'Oggetti', pictures: 'Foto', constellations: 'Costellazioni', sessions: 'Sessioni',
        integration: 'Integrazione', last_session: 'Ultima sessione', plan_my_night: 'Plan My Night',
        no_plan: 'Nessun piano stanotte', targets_done: 'obiettivi completati', now: 'Ora', next: 'Prossimo', equipment: 'Attrezzatura',
        plan_in_progress: 'Piano in corso', plan: 'Piano', latest_picture: 'Ultima foto Astrodex',
        waiting: 'In attesa di Home Assistant...',
        no_entities: "Nessuna entità MyAstroBoard trovata. Scegli un dispositivo nell'editor della scheda, oppure controlla il prefisso delle entità e che il modulo del connettore MQTT sia attivo.",
        in: 'tra', ago: 'fa',
        period: { day: 'Giorno', civil_twilight: 'Crepuscolo civile', nautical_twilight: 'Crepuscolo nautico',
                  astronomical_twilight: 'Crepuscolo astronomico', astronomical_night: 'Notte astronomica', unknown: 'Sconosciuto' },
        moon_phase: { 'New Moon': 'Luna nuova', 'Waxing Crescent': 'Luna crescente', 'First Quarter': 'Primo quarto',
                      'Waxing Gibbous': 'Gibbosa crescente', 'Full Moon': 'Luna piena', 'Waning Gibbous': 'Gibbosa calante',
                      'Last Quarter': 'Ultimo quarto', 'Waning Crescent': 'Luna calante' },
        dew: { LOW: 'Basso', MODERATE: 'Moderato', HIGH: 'Alto', CRITICAL: 'Critico', UNKNOWN: 'Sconosciuto' },
        plan_state: { none: 'nessuno', current: 'in corso', previous: 'precedente' },
        editor: { mode: 'Modalità', device: 'Dispositivo', title: 'Titolo', title_ph: 'Titolo opzionale', icon: 'Icona',
                  mode_sky: 'Cielo ora (una località)', mode_tonight: 'Stanotte (una località)', mode_activity: 'Attività (un utente)',
                  no_devices: "Nessun dispositivo MyAstroBoard di tipo {model} trovato. Attiva il modulo corrispondente in MyAstroBoard (Parametri > Connettori > MQTT); un dispositivo utente richiede anche che l'utente attivi la pubblicazione in Le mie impostazioni > Personalizza.",
                  device_help: 'Dispositivi MyAstroBoard da Impostazioni > Dispositivi e servizi > MQTT.',
                  prefix: 'Prefisso entità', prefix_help: 'Ripiego quando nessun dispositivo viene trovato: la parte degli id entità prima del nome, es. myastroboard_giardino.',
                  picture: 'Ultima foto', picture_hidden: 'Nascosta', picture_small: 'Miniatura piccola (160 px)', picture_medium: 'Miniatura (240 px)', picture_large: 'Grande (400 px)', picture_full: 'Dimensione reale', picture_help: 'La miniatura è ritagliata alla larghezza della scheda; un clic apre la foto completa.',
                  model_location: 'località', model_user: 'utente' },
    },
    pt: {
        sky_now: 'Céu agora', tonight: 'Esta noite', activity: 'Atividade',
        night_score: 'Pontuação da noite', best_window: 'Melhor janela', best_window_score: 'Pontuação da janela', hours_short: 'h',
        sunset: 'Pôr do Sol', astro_dusk: 'Crepúsculo astro', astro_dawn: 'Aurora astro', sunrise: 'Nascer do Sol',
        moon: 'Lua', illumination: 'Iluminação', moonrise: 'Nascer da Lua', moonset: 'Pôr da Lua',
        weather: 'Meteorologia', clouds: 'Nuvens', temperature: 'Temperatura', humidity: 'Humidade', wind: 'Vento',
        seeing: 'Seeing', transparency: 'Transparência', dew_risk: 'Risco de orvalho',
        night_starts: 'Início da noite', night_ends: 'Fim da noite', dark_window: 'Janela de escuridão', dark_until: 'Escuro até',
        top_targets: 'Melhores alvos', score: 'pontuação', coming_up: 'A seguir', next_iss_pass: 'Próxima passagem da ISS',
        next_css_pass: 'Próxima passagem da CSS',
        objects: 'Objetos', pictures: 'Fotos', constellations: 'Constelações', sessions: 'Sessões',
        integration: 'Integração', last_session: 'Última sessão', plan_my_night: 'Plan My Night',
        no_plan: 'Sem plano esta noite', targets_done: 'alvos concluídos', now: 'Agora', next: 'Seguinte', equipment: 'Equipamento',
        plan_in_progress: 'Plano em curso', plan: 'Plano', latest_picture: 'Última foto do Astrodex',
        waiting: 'À espera do Home Assistant...',
        no_entities: 'Nenhuma entidade MyAstroBoard encontrada. Escolha um dispositivo no editor do cartão, ou verifique o prefixo de entidade e se o módulo do conector MQTT está ativo.',
        in: 'em', ago: 'há',
        period: { day: 'Dia', civil_twilight: 'Crepúsculo civil', nautical_twilight: 'Crepúsculo náutico',
                  astronomical_twilight: 'Crepúsculo astronómico', astronomical_night: 'Noite astronómica', unknown: 'Desconhecido' },
        moon_phase: { 'New Moon': 'Lua nova', 'Waxing Crescent': 'Lua crescente', 'First Quarter': 'Quarto crescente',
                      'Waxing Gibbous': 'Gibosa crescente', 'Full Moon': 'Lua cheia', 'Waning Gibbous': 'Gibosa minguante',
                      'Last Quarter': 'Quarto minguante', 'Waning Crescent': 'Lua minguante' },
        dew: { LOW: 'Baixo', MODERATE: 'Moderado', HIGH: 'Alto', CRITICAL: 'Crítico', UNKNOWN: 'Desconhecido' },
        plan_state: { none: 'nenhum', current: 'em curso', previous: 'anterior' },
        editor: { mode: 'Modo', device: 'Dispositivo', title: 'Título', title_ph: 'Título opcional', icon: 'Ícone',
                  mode_sky: 'Céu agora (um local)', mode_tonight: 'Esta noite (um local)', mode_activity: 'Atividade (um utilizador)',
                  no_devices: 'Nenhum dispositivo MyAstroBoard do tipo {model} encontrado. Ative o módulo correspondente no MyAstroBoard (Parâmetros > Conectores > MQTT); um dispositivo de utilizador também exige que esse utilizador ative a publicação em Minhas configurações > Personalizar.',
                  device_help: 'Dispositivos MyAstroBoard de Definições > Dispositivos e serviços > MQTT.',
                  prefix: 'Prefixo de entidade', prefix_help: 'Alternativa quando nenhum dispositivo é detetado: a parte dos ids de entidade antes do nome, p. ex. myastroboard_jardim.',
                  picture: 'Última foto', picture_hidden: 'Oculta', picture_small: 'Miniatura pequena (160 px)', picture_medium: 'Miniatura (240 px)', picture_large: 'Grande (400 px)', picture_full: 'Tamanho real', picture_help: 'A miniatura é recortada à largura do cartão; um clique abre a foto completa.',
                  model_location: 'local', model_user: 'utilizador' },
    },
};

function languageOf(hass) {
    const raw = (hass && ((hass.locale && hass.locale.language) || hass.language)) || navigator.language || 'en';
    const short = String(raw).toLowerCase().split(/[-_]/)[0];
    return TRANSLATIONS[short] ? short : 'en';
}

function translator(hass) {
    const lang = languageOf(hass);
    const table = TRANSLATIONS[lang];
    const fallback = TRANSLATIONS.en;
    return (key, params) => {
        const parts = key.split('.');
        let value = table;
        let alt = fallback;
        for (const part of parts) {
            value = value && value[part];
            alt = alt && alt[part];
        }
        let text = value !== undefined ? value : alt;
        if (text === undefined) return key;
        if (params) Object.keys(params).forEach(k => { text = String(text).replace(`{${k}}`, params[k]); });
        return text;
    };
}

const PERIOD_ICONS = {
    day: 'mdi:white-balance-sunny',
    civil_twilight: 'mdi:weather-sunset',
    nautical_twilight: 'mdi:weather-sunset-down',
    astronomical_twilight: 'mdi:weather-night-partly-cloudy',
    astronomical_night: 'mdi:weather-night',
    unknown: 'mdi:help-circle-outline',
};

const STYLES = `
    :host { display: block; }
    ha-card { padding: 16px; box-sizing: border-box; }
    .header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    .title { font-size: 1.1em; font-weight: 500; color: var(--primary-text-color); display: flex; align-items: center; gap: 8px; }
    .title ha-icon { color: var(--state-icon-color, var(--primary-color)); }
    .badge { font-size: 0.8em; padding: 2px 10px; border-radius: 12px; background: var(--secondary-background-color); color: var(--secondary-text-color); white-space: nowrap; }
    .badge.on { background: var(--primary-color); color: var(--text-primary-color, #fff); }
    .hero { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
    .hero .big { font-size: 2.4em; font-weight: 300; line-height: 1; color: var(--primary-text-color); cursor: pointer; }
    .hero .unit { font-size: 0.45em; color: var(--secondary-text-color); margin-left: 2px; }
    .hero .right { flex: 1; }
    .hero .sub { color: var(--secondary-text-color); font-size: 0.9em; margin-top: 6px; }
    .hero .sub strong { color: var(--primary-text-color); font-weight: 500; }
    .gauge { height: 6px; border-radius: 3px; background: var(--divider-color); overflow: hidden; }
    .gauge > div { height: 100%; background: var(--primary-color); transition: width 0.4s ease; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px 12px; }
    .tile { cursor: pointer; padding: 6px 8px; border-radius: 8px; }
    .tile:hover { background: var(--secondary-background-color); }
    .tile .label { font-size: 0.75em; color: var(--secondary-text-color); display: flex; align-items: center; gap: 4px; }
    .tile .label ha-icon { --mdc-icon-size: 16px; }
    .tile .value { font-size: 1.05em; color: var(--primary-text-color); margin-top: 2px; }
    .tile .value small { color: var(--secondary-text-color); font-size: 0.8em; margin-left: 4px; }
    .section { margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--divider-color); }
    .section h3 { margin: 0 0 6px; font-size: 0.8em; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; color: var(--secondary-text-color); }
    .list { display: flex; flex-direction: column; gap: 4px; }
    .row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
    .row:hover { background: var(--secondary-background-color); }
    .row .name { color: var(--primary-text-color); }
    .row .meta { color: var(--secondary-text-color); font-size: 0.85em; white-space: nowrap; }
    .picture { position: relative; margin-top: 12px; border-radius: 8px; overflow: hidden; background: var(--secondary-background-color); }
    .picture img { display: block; width: 100%; height: var(--mab-picture-height, 240px); object-fit: cover; object-position: center; cursor: pointer; }
    .picture.contain img { object-fit: contain; }
    .picture.natural img { height: auto; }
    .picture .caption { position: absolute; left: 0; right: 0; bottom: 0; padding: 18px 10px 6px; font-size: 0.85em; color: #fff; background: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.7)); text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
    .warning { color: var(--warning-color, #ffa600); padding: 8px; font-size: 0.9em; }
    .muted { color: var(--secondary-text-color); }
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
}

function icon(name) {
    const node = document.createElement('ha-icon');
    node.setAttribute('icon', name);
    return node;
}

function isUnknown(state) {
    return !state || state.state === 'unknown' || state.state === 'unavailable' || state.state === '';
}

function num(state, digits = 0) {
    if (isUnknown(state)) return null;
    const value = Number(state.state);
    if (Number.isNaN(value)) return null;
    return digits === null ? value : Number(value.toFixed(digits));
}

function fmtNum(state, digits = 0) {
    const value = num(state, digits);
    return value === null ? '-' : String(value);
}

function normalizePrefix(prefix) {
    let base = String(prefix || '').trim();
    if (!base) return '';
    if (base.includes('.')) base = base.split('.').slice(1).join('.');
    return base.replace(/_+$/, '');
}

function deviceName(device) {
    return (device && (device.name_by_user || device.name)) || '';
}

/** MyAstroBoard devices of the given model ("Location" / "User"), from the device registry. */
function myAstroBoardDevices(hass, model) {
    const registry = hass && hass.devices;
    if (!registry) return [];
    return Object.values(registry)
        .filter(d => d && d.manufacturer === MANUFACTURER && (!model || d.model === model))
        .sort((a, b) => deviceName(a).localeCompare(deviceName(b)));
}

/**
 * Resolve every key of a mode to an entity id among the entities of one device. A suffix can
 * match several ids ("_sky_period" also ends "..._next_sky_period"): the shortest wins.
 */
function resolveByDevice(hass, deviceId, mode) {
    const registry = hass && hass.entities;
    if (!registry || !deviceId) return null;
    const ids = Object.values(registry).filter(e => e && e.device_id === deviceId).map(e => e.entity_id);
    if (!ids.length) return null;
    const resolved = {};
    Object.entries(ENTITIES[mode]).forEach(([key, [domain, suffix]]) => {
        const candidates = ids.filter(id => id.startsWith(`${domain}.`) && id.endsWith(`_${suffix}`));
        if (candidates.length) resolved[key] = candidates.sort((a, b) => a.length - b.length)[0];
    });
    return resolved;
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------

class MyAstroBoardCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = null;
        this._hass = null;
        this._lastRenderKey = null;
        this._resolved = null;
        this._resolvedFor = null;
    }

    static getConfigElement() {
        return document.createElement(`${CARD_TYPE}-editor`);
    }

    static getStubConfig(hass) {
        const location = myAstroBoardDevices(hass, 'Location')[0];
        if (location) return { mode: 'sky', device: location.id };
        return { mode: 'sky', entity_prefix: 'myastroboard_backyard' };
    }

    setConfig(config) {
        if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
        const mode = config.mode || 'sky';
        if (!ENTITIES[mode]) throw new Error(`Unknown mode "${mode}" - use sky, tonight or activity`);
        const prefix = normalizePrefix(config.entity_prefix);
        if (!config.device && !prefix) throw new Error('device (from the editor) or entity_prefix is required');
        this._config = { ...config, mode, entity_prefix: prefix };
        this._lastRenderKey = null;
        this._resolvedFor = null;
        this._render();
    }

    set hass(hass) {
        this._hass = hass;
        this._render();
    }

    getCardSize() {
        return this._config && this._config.mode === 'activity' ? 6 : 4;
    }

    // --- entity access -----------------------------------------------------

    _resolution() {
        if (!this._hass || !this._config) return {};
        const registrySize = this._hass.entities ? Object.keys(this._hass.entities).length : 0;
        const stamp = `${this._config.device || ''}|${this._config.entity_prefix}|${this._config.mode}|${registrySize}`;
        if (this._resolvedFor === stamp) return this._resolved;
        let resolved = this._config.device ? resolveByDevice(this._hass, this._config.device, this._config.mode) : null;
        if (!resolved && this._config.entity_prefix) {
            resolved = {};
            Object.entries(ENTITIES[this._config.mode]).forEach(([key, [domain, suffix]]) => {
                resolved[key] = `${domain}.${this._config.entity_prefix}_${suffix}`;
            });
        }
        this._resolved = resolved || {};
        this._resolvedFor = stamp;
        return this._resolved;
    }

    _entityId(key) {
        return this._resolution()[key] || null;
    }

    _state(key) {
        const id = this._entityId(key);
        return id && this._hass ? this._hass.states[id] || null : null;
    }

    _text(key, fallback = '-') {
        const state = this._state(key);
        return isUnknown(state) ? fallback : state.state;
    }

    _attr(key, name) {
        const state = this._state(key);
        return state && state.attributes ? state.attributes[name] : undefined;
    }

    _moreInfo(key) {
        const entityId = this._entityId(key);
        if (!entityId) return;
        this.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
    }

    // --- formatting ----------------------------------------------------------

    _locale() {
        return (this._hass && this._hass.locale && this._hass.locale.language) || navigator.language;
    }

    _timeZone() {
        return this._hass && this._hass.config ? this._hass.config.time_zone : undefined;
    }

    _fmtTime(key, withDate = false) {
        const state = this._state(key);
        if (isUnknown(state)) return '-';
        const date = new Date(state.state);
        if (Number.isNaN(date.getTime())) return '-';
        const opts = { hour: '2-digit', minute: '2-digit', timeZone: this._timeZone() };
        // Honour the user's Home Assistant time format (12 / 24); "language" / "system" = Intl default
        const timeFormat = this._hass && this._hass.locale ? this._hass.locale.time_format : undefined;
        if (timeFormat === '24') opts.hour12 = false;
        else if (timeFormat === '12') opts.hour12 = true;
        if (withDate || Math.abs(date - Date.now()) > 20 * 3600 * 1000) {
            opts.month = 'short';
            opts.day = 'numeric';
        }
        try {
            return new Intl.DateTimeFormat(this._locale(), opts).format(date);
        } catch (err) {
            return date.toLocaleString();
        }
    }

    _fmtRelative(key) {
        const state = this._state(key);
        if (isUnknown(state)) return '';
        const date = new Date(state.state);
        if (Number.isNaN(date.getTime())) return '';
        const diffMin = Math.round((date - Date.now()) / 60000);
        const abs = Math.abs(diffMin);
        let span;
        if (abs < 60) span = `${abs} min`;
        else if (abs < 48 * 60) span = `${Math.floor(abs / 60)} h ${abs % 60 ? (abs % 60) + ' min' : ''}`.trim();
        else span = `${Math.round(abs / 1440)} d`;
        return diffMin >= 0 ? `${this._t('in')} ${span}` : `${this._t('ago')} ${span}`;
    }

    _period(key) {
        const value = this._text(key, 'unknown');
        return this._t(`period.${value}`) === `period.${value}` ? value : this._t(`period.${value}`);
    }

    // --- rendering -----------------------------------------------------------

    _renderKey() {
        if (!this._hass || !this._config) return 'nohass';
        const ids = Object.values(this._resolution());
        return `${languageOf(this._hass)}|` + ids.map(id => {
            const s = this._hass.states[id];
            return s ? `${id}=${s.state}|${s.last_updated}` : `${id}=?`;
        }).join(';');
    }

    _render() {
        if (!this._config) return;
        const key = this._renderKey();
        if (key === this._lastRenderKey) return;
        this._lastRenderKey = key;
        this._t = translator(this._hass);

        const root = this.shadowRoot;
        while (root.firstChild) root.removeChild(root.firstChild);
        const style = el('style');
        style.textContent = STYLES;
        root.appendChild(style);

        const card = document.createElement('ha-card');
        root.appendChild(card);

        if (!this._hass) {
            card.appendChild(el('div', 'muted', this._t('waiting')));
            return;
        }

        const anyEntity = Object.keys(ENTITIES[this._config.mode]).some(k => this._state(k));
        card.appendChild(this._header());
        if (!anyEntity) {
            const warn = el('div', 'warning');
            warn.appendChild(icon('mdi:alert-circle-outline'));
            warn.appendChild(document.createTextNode(` ${this._t('no_entities')}`));
            card.appendChild(warn);
            return;
        }
        if (this._config.mode === 'sky') this._renderSky(card);
        else if (this._config.mode === 'tonight') this._renderTonight(card);
        else this._renderActivity(card);
    }

    _defaultTitle() {
        const device = this._hass && this._hass.devices && this._config.device ? this._hass.devices[this._config.device] : null;
        const name = deviceName(device).replace(/^MyAstroBoard\s*-\s*/i, '');
        const label = this._t({ sky: 'sky_now', tonight: 'tonight', activity: 'activity' }[this._config.mode]);
        return name ? `${name} - ${label}` : label;
    }

    _header() {
        const header = el('div', 'header');
        const title = el('div', 'title');
        const icons = { sky: 'mdi:weather-night', tonight: 'mdi:telescope', activity: 'mdi:account-star' };
        title.appendChild(icon(this._config.icon || icons[this._config.mode]));
        title.appendChild(document.createTextNode(this._config.title || this._defaultTitle()));
        header.appendChild(title);

        if (this._config.mode === 'sky') {
            const period = this._text('period', 'unknown');
            header.appendChild(el('span', `badge${period === 'astronomical_night' ? ' on' : ''}`, this._period('period')));
        } else if (this._config.mode === 'activity') {
            const active = this._state('planActive');
            const on = active && active.state === 'on';
            const planState = this._text('planState', 'none');
            const label = on ? this._t('plan_in_progress') : `${this._t('plan')}: ${this._t(`plan_state.${planState}`)}`;
            header.appendChild(el('span', `badge${on ? ' on' : ''}`, label));
        }
        return header;
    }

    _tile(key, label, value, iconName, unit) {
        const tile = el('div', 'tile');
        const lbl = el('div', 'label');
        if (iconName) lbl.appendChild(icon(iconName));
        lbl.appendChild(document.createTextNode(label));
        const val = el('div', 'value', value);
        if (unit && value !== '-') val.appendChild(el('small', null, unit));
        tile.appendChild(lbl);
        tile.appendChild(val);
        tile.addEventListener('click', () => this._moreInfo(key));
        return tile;
    }

    _hero(scoreKey, score, max, subtitle) {
        const hero = el('div', 'hero');
        const big = el('div', 'big', score === null ? '-' : String(score));
        if (score !== null) big.appendChild(el('span', 'unit', `/ ${max}`));
        big.addEventListener('click', () => this._moreInfo(scoreKey));
        hero.appendChild(big);
        const right = el('div', 'right');
        const gauge = el('div', 'gauge');
        const fill = el('div');
        fill.style.width = `${score === null ? 0 : Math.max(0, Math.min(100, (score / max) * 100))}%`;
        gauge.appendChild(fill);
        right.appendChild(gauge);
        const sub = el('div', 'sub');
        subtitle(sub);
        right.appendChild(sub);
        hero.appendChild(right);
        return hero;
    }

    _renderSky(card) {
        const t = this._t;
        card.appendChild(this._hero('score', num(this._state('score'), 1), 10, sub => {
            sub.appendChild(document.createTextNode(`${t('night_score')} - `));
            sub.appendChild(el('strong', null, this._period('period')));
            const next = this._text('nextPeriod', '');
            const rel = this._fmtRelative('nextPeriodAt');
            if (next && rel) sub.appendChild(document.createTextNode(`, ${this._period('nextPeriod')} ${rel}`));
        }));

        const moonPhase = this._text('moonPhase');
        const grid = el('div', 'grid');
        grid.appendChild(this._tile('sunset', t('sunset'), this._fmtTime('sunset'), 'mdi:weather-sunset-down'));
        grid.appendChild(this._tile('astroDusk', t('astro_dusk'), this._fmtTime('astroDusk'), 'mdi:weather-night'));
        grid.appendChild(this._tile('astroDawn', t('astro_dawn'), this._fmtTime('astroDawn'), 'mdi:weather-sunset-up'));
        grid.appendChild(this._tile('sunrise', t('sunrise'), this._fmtTime('sunrise'), 'mdi:white-balance-sunny'));
        grid.appendChild(this._tile('moonPhase', t('moon'), moonPhase === '-' ? '-' : t(`moon_phase.${moonPhase}`), 'mdi:moon-waxing-crescent'));
        grid.appendChild(this._tile('moonIllum', t('illumination'), fmtNum(this._state('moonIllum'), 0), 'mdi:brightness-6', '%'));
        grid.appendChild(this._tile('moonrise', t('moonrise'), this._fmtTime('moonrise'), 'mdi:arrow-up-thin'));
        grid.appendChild(this._tile('moonset', t('moonset'), this._fmtTime('moonset'), 'mdi:arrow-down-thin'));
        card.appendChild(grid);

        if (this._config.show_weather !== false && this._state('clouds')) {
            const section = el('div', 'section');
            section.appendChild(el('h3', null, t('weather')));
            const wgrid = el('div', 'grid');
            const dew = this._text('dew');
            wgrid.appendChild(this._tile('clouds', t('clouds'), fmtNum(this._state('clouds'), 0), 'mdi:weather-cloudy', '%'));
            wgrid.appendChild(this._tile('temperature', t('temperature'), fmtNum(this._state('temperature'), 1), 'mdi:thermometer', '°C'));
            wgrid.appendChild(this._tile('humidity', t('humidity'), fmtNum(this._state('humidity'), 0), 'mdi:water-percent', '%'));
            wgrid.appendChild(this._tile('wind', t('wind'), fmtNum(this._state('wind'), 0), 'mdi:weather-windy', 'km/h'));
            wgrid.appendChild(this._tile('seeing', t('seeing'), fmtNum(this._state('seeing'), 1), 'mdi:blur', '/ 10'));
            wgrid.appendChild(this._tile('transparency', t('transparency'), fmtNum(this._state('transparency'), 1), 'mdi:eye-outline', '/ 10'));
            wgrid.appendChild(this._tile('dew', t('dew_risk'), dew === '-' ? '-' : t(`dew.${dew}`), 'mdi:water-alert'));
            section.appendChild(wgrid);
            card.appendChild(section);
        }
    }

    _renderTonight(card) {
        const t = this._t;
        // Hero is the night score (observation_score, /10) - the same headline metric as "Sky
        // now" - not the best-window score: that one only rates the best window itself (can be
        // low on a short/moon-clipped window even on an excellent night) and stays available as
        // its own grid tile below, so a bad best-window score no longer overshadows a good night.
        card.appendChild(this._hero('score', num(this._state('score'), 1), 10, sub => {
            const start = this._fmtTime('bestStart');
            const end = this._fmtTime('bestEnd');
            sub.appendChild(document.createTextNode(`${t('best_window')} `));
            sub.appendChild(el('strong', null, start === '-' ? '-' : `${start} - ${end}`));
            const dur = num(this._state('bestDuration'), 1);
            if (dur !== null) sub.appendChild(document.createTextNode(` (${dur} ${t('hours_short')})`));
            const moon = this._text('bestMoon', '');
            if (moon) sub.appendChild(document.createTextNode(` - ${moon}`));
        }));

        const grid = el('div', 'grid');
        grid.appendChild(this._tile('nightStart', t('night_starts'), this._fmtTime('nightStart'), 'mdi:weather-night'));
        grid.appendChild(this._tile('nightEnd', t('night_ends'), this._fmtTime('nightEnd'), 'mdi:weather-sunset-up'));
        grid.appendChild(this._tile('darkStart', t('dark_window'), this._fmtTime('darkStart'), 'mdi:moon-new'));
        grid.appendChild(this._tile('darkEnd', t('dark_until'), this._fmtTime('darkEnd'), 'mdi:moon-new'));
        grid.appendChild(this._tile('bestScore', t('best_window_score'), fmtNum(this._state('bestScore'), 0), 'mdi:target', '/ 100'));
        card.appendChild(grid);

        const targets = this._attr('topTarget', 'top_targets');
        const section = el('div', 'section');
        section.appendChild(el('h3', null, t('top_targets')));
        const list = el('div', 'list');
        if (Array.isArray(targets) && targets.length) {
            targets.slice(0, this._config.top_targets || 5).forEach(target => {
                const row = el('div', 'row');
                row.appendChild(el('span', 'name', target.name || '-'));
                row.appendChild(el('span', 'meta', [
                    target.object_type, target.constellation,
                    target.astro_score !== null && target.astro_score !== undefined ? `${t('score')} ${Number(target.astro_score).toFixed(2)}` : null,
                    target.max_altitude !== null && target.max_altitude !== undefined ? `${Math.round(target.max_altitude)}°` : null,
                ].filter(Boolean).join(' - ')));
                row.addEventListener('click', () => this._moreInfo('topTarget'));
                list.appendChild(row);
            });
        } else {
            const row = el('div', 'row');
            row.appendChild(el('span', 'name', this._text('topTarget')));
            row.appendChild(el('span', 'meta', fmtNum(this._state('topScore'), 2)));
            row.addEventListener('click', () => this._moreInfo('topTarget'));
            list.appendChild(row);
        }
        section.appendChild(list);
        card.appendChild(section);

        if (this._state('nextEvent') || this._state('nextIss') || this._state('nextCss')) {
            const events = el('div', 'section');
            events.appendChild(el('h3', null, t('coming_up')));
            const elist = el('div', 'list');
            // "Next event" is the single earliest event across every kind MyAstroBoard tracks; when
            // it is an ISS or CSS pass, it is the very same pass the dedicated row below reports
            // (just timestamped at peak instead of rise). Showing both duplicates one pass under two
            // labels a few minutes apart, so skip the generic row in that case.
            const DEDICATED_ROW_BY_EVENT_TYPE = { 'ISS Pass': 'nextIss', 'CSS Pass': 'nextCss' };
            const dedicatedKey = DEDICATED_ROW_BY_EVENT_TYPE[this._attr('nextEvent', 'event_type')];
            const duplicatesDedicatedRow = dedicatedKey && this._state(dedicatedKey);
            if (this._state('nextEvent') && !duplicatesDedicatedRow) {
                const row = el('div', 'row');
                row.appendChild(el('span', 'name', this._text('nextEvent')));
                row.appendChild(el('span', 'meta', `${this._fmtTime('nextEventAt', true)} ${this._fmtRelative('nextEventAt')}`.trim()));
                row.addEventListener('click', () => this._moreInfo('nextEvent'));
                elist.appendChild(row);
            }
            if (this._state('nextIss')) {
                const row = el('div', 'row');
                row.appendChild(el('span', 'name', t('next_iss_pass')));
                row.appendChild(el('span', 'meta', `${this._fmtTime('nextIss', true)} ${this._fmtRelative('nextIss')}`.trim()));
                row.addEventListener('click', () => this._moreInfo('nextIss'));
                elist.appendChild(row);
            }
            if (this._state('nextCss')) {
                const row = el('div', 'row');
                row.appendChild(el('span', 'name', t('next_css_pass')));
                row.appendChild(el('span', 'meta', `${this._fmtTime('nextCss', true)} ${this._fmtRelative('nextCss')}`.trim()));
                row.addEventListener('click', () => this._moreInfo('nextCss'));
                elist.appendChild(row);
            }
            events.appendChild(elist);
            card.appendChild(events);
        }
    }

    _renderActivity(card) {
        const t = this._t;
        const grid = el('div', 'grid');
        grid.appendChild(this._tile('objects', t('objects'), fmtNum(this._state('objects')), 'mdi:star-box-multiple'));
        grid.appendChild(this._tile('pictures', t('pictures'), fmtNum(this._state('pictures')), 'mdi:image-multiple'));
        grid.appendChild(this._tile('constellations', t('constellations'), fmtNum(this._state('constellations')), 'mdi:creation'));
        grid.appendChild(this._tile('sessions', t('sessions'), fmtNum(this._state('sessions')), 'mdi:notebook'));
        grid.appendChild(this._tile('integration', t('integration'), fmtNum(this._state('integration'), 1), 'mdi:timer-outline', t('hours_short')));
        grid.appendChild(this._tile('lastSession', t('last_session'), this._text('lastSession'), 'mdi:calendar-check'));
        card.appendChild(grid);

        const planState = this._text('planState', 'none');
        const plan = el('div', 'section');
        plan.appendChild(el('h3', null, t('plan_my_night')));
        if (planState === 'none') {
            plan.appendChild(el('div', 'muted', t('no_plan')));
        } else {
            plan.appendChild(this._hero('planProgress', num(this._state('planProgress'), 0), 100, sub => {
                sub.appendChild(document.createTextNode(`${this._fmtTime('planStart')} - ${this._fmtTime('planEnd')}, `));
                sub.appendChild(el('strong', null, `${this._text('planDone', '0')} / ${this._text('planTotal', '0')} ${t('targets_done')}`));
            }));
            const pgrid = el('div', 'grid');
            pgrid.appendChild(this._tile('planCurrent', t('now'), this._text('planCurrent'), 'mdi:target'));
            pgrid.appendChild(this._tile('planNext', t('next'), this._text('planNext'), 'mdi:skip-next'));
            pgrid.appendChild(this._tile('equipment', t('equipment'), this._text('equipment'), 'mdi:telescope'));
            plan.appendChild(pgrid);
        }
        card.appendChild(plan);

        const picture = this._state('picture');
        if (this._config.show_picture !== false && picture && picture.attributes && picture.attributes.entity_picture) {
            // A bounded, cropped thumbnail by default: a portrait photo at natural size would
            // otherwise make the card several screens tall. picture_height: 0 = natural size.
            const height = this._config.picture_height === undefined ? 240 : Number(this._config.picture_height);
            const wrap = el('div', `picture${height > 0 ? '' : ' natural'}${this._config.picture_fit === 'contain' ? ' contain' : ''}`);
            if (height > 0) wrap.style.setProperty('--mab-picture-height', `${height}px`);
            const img = document.createElement('img');
            const path = picture.attributes.entity_picture;
            img.src = this._hass.hassUrl ? this._hass.hassUrl(path) : path;
            img.alt = picture.attributes.object || t('latest_picture');
            img.loading = 'lazy';
            img.addEventListener('click', () => this._moreInfo('picture'));
            wrap.appendChild(img);
            wrap.appendChild(el('div', 'caption', [
                picture.attributes.object, picture.attributes.date, picture.attributes.equipment,
                picture.attributes.rating ? `${picture.attributes.rating}/5` : null,
            ].filter(Boolean).join(' - ') || t('latest_picture')));
            card.appendChild(wrap);
        }
    }
}

// ---------------------------------------------------------------------------
// Editor (visual configuration in the dashboard editor)
// ---------------------------------------------------------------------------

class MyAstroBoardCardEditor extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._config = {};
        this._hass = null;
    }

    setConfig(config) {
        this._config = { ...config };
        this._render();
    }

    set hass(hass) {
        const first = !this._hass;
        this._hass = hass;
        if (first) this._render();
    }

    _emit() {
        this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config }, bubbles: true, composed: true }));
    }

    _field(label, input, help) {
        const wrap = el('label');
        wrap.style.display = 'block';
        wrap.style.margin = '8px 0';
        const lbl = el('div', null, label);
        lbl.style.fontSize = '0.85em';
        lbl.style.color = 'var(--secondary-text-color)';
        wrap.appendChild(lbl);
        input.style.width = '100%';
        input.style.boxSizing = 'border-box';
        input.style.padding = '8px';
        input.style.border = '1px solid var(--divider-color)';
        input.style.borderRadius = '6px';
        input.style.background = 'var(--card-background-color)';
        input.style.color = 'var(--primary-text-color)';
        wrap.appendChild(input);
        if (help) {
            const h = el('div', null, help);
            h.style.fontSize = '0.75em';
            h.style.color = 'var(--secondary-text-color)';
            h.style.marginTop = '2px';
            wrap.appendChild(h);
        }
        return wrap;
    }

    _render() {
        const t = translator(this._hass);
        const root = this.shadowRoot;
        while (root.firstChild) root.removeChild(root.firstChild);
        const box = el('div');
        box.style.padding = '4px 0';

        const mode = this._config.mode || 'sky';
        const modeSelect = document.createElement('select');
        [['sky', t('editor.mode_sky')], ['tonight', t('editor.mode_tonight')], ['activity', t('editor.mode_activity')]].forEach(([value, label]) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            if (mode === value) opt.selected = true;
            modeSelect.appendChild(opt);
        });
        modeSelect.addEventListener('change', () => {
            this._config.mode = modeSelect.value;
            // A location device is meaningless in activity mode and vice versa: re-pick.
            const model = MODEL_BY_MODE[modeSelect.value];
            const current = this._hass && this._hass.devices ? this._hass.devices[this._config.device] : null;
            if (!current || current.model !== model) {
                const first = myAstroBoardDevices(this._hass, model)[0];
                if (first) this._config.device = first.id;
                else delete this._config.device;
            }
            this._emit();
            this._render();
        });
        box.appendChild(this._field(t('editor.mode'), modeSelect));

        const model = MODEL_BY_MODE[mode];
        const devices = myAstroBoardDevices(this._hass, model);
        if (devices.length) {
            const deviceSelect = document.createElement('select');
            devices.forEach(device => {
                const opt = document.createElement('option');
                opt.value = device.id;
                opt.textContent = deviceName(device);
                if (this._config.device === device.id) opt.selected = true;
                deviceSelect.appendChild(opt);
            });
            if (!this._config.device || !devices.some(d => d.id === this._config.device)) {
                // Nothing valid selected yet: adopt the first device so the preview shows data.
                this._config.device = devices[0].id;
                delete this._config.entity_prefix;
                this._emit();
            }
            deviceSelect.addEventListener('change', () => {
                this._config.device = deviceSelect.value;
                delete this._config.entity_prefix;
                this._emit();
            });
            box.appendChild(this._field(t('editor.device'), deviceSelect, t('editor.device_help')));
        } else {
            const note = el('div', null, t('editor.no_devices', { model: t(model === 'User' ? 'editor.model_user' : 'editor.model_location') }));
            note.style.color = 'var(--warning-color, #ffa600)';
            note.style.fontSize = '0.85em';
            note.style.margin = '8px 0';
            box.appendChild(note);
            const prefix = document.createElement('input');
            prefix.type = 'text';
            prefix.value = this._config.entity_prefix || '';
            prefix.placeholder = 'myastroboard_backyard';
            prefix.addEventListener('change', () => {
                this._config.entity_prefix = prefix.value.trim();
                delete this._config.device;
                this._emit();
            });
            box.appendChild(this._field(t('editor.prefix'), prefix, t('editor.prefix_help')));
        }

        const title = document.createElement('input');
        title.type = 'text';
        title.value = this._config.title || '';
        title.placeholder = t('editor.title_ph');
        title.addEventListener('change', () => { this._config.title = title.value.trim() || undefined; this._emit(); });
        box.appendChild(this._field(t('editor.title'), title));

        const iconInput = document.createElement('input');
        iconInput.type = 'text';
        iconInput.value = this._config.icon || '';
        iconInput.placeholder = 'mdi:telescope';
        iconInput.addEventListener('change', () => { this._config.icon = iconInput.value.trim() || undefined; this._emit(); });
        box.appendChild(this._field(t('editor.icon'), iconInput));

        if (mode === 'activity') {
            const sizes = [['hidden', 0], ['small', 160], ['medium', 240], ['large', 400], ['full', -1]];
            const current = this._config.show_picture === false ? 'hidden'
                : this._config.picture_height === undefined ? 'medium'
                : Number(this._config.picture_height) <= 0 ? 'full'
                : (sizes.find(([, h]) => h === Number(this._config.picture_height)) || ['custom'])[0];
            const pictureSelect = document.createElement('select');
            sizes.forEach(([value]) => {
                const opt = document.createElement('option');
                opt.value = value;
                opt.textContent = t(`editor.picture_${value}`);
                if (current === value) opt.selected = true;
                pictureSelect.appendChild(opt);
            });
            if (current === 'custom') {
                const opt = document.createElement('option');
                opt.value = 'custom';
                opt.textContent = `${this._config.picture_height} px`;
                opt.selected = true;
                pictureSelect.appendChild(opt);
            }
            pictureSelect.addEventListener('change', () => {
                const choice = sizes.find(([value]) => value === pictureSelect.value);
                if (!choice) return;
                if (choice[0] === 'hidden') {
                    this._config.show_picture = false;
                } else {
                    delete this._config.show_picture;
                    if (choice[0] === 'medium') delete this._config.picture_height;
                    else this._config.picture_height = choice[1] === -1 ? 0 : choice[1];
                }
                this._emit();
            });
            box.appendChild(this._field(t('editor.picture'), pictureSelect, t('editor.picture_help')));
        }

        root.appendChild(box);
    }
}

if (!customElements.get(CARD_TYPE)) customElements.define(CARD_TYPE, MyAstroBoardCard);
if (!customElements.get(`${CARD_TYPE}-editor`)) customElements.define(`${CARD_TYPE}-editor`, MyAstroBoardCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === CARD_TYPE)) {
    window.customCards.push({
        type: CARD_TYPE,
        name: 'MyAstroBoard Card',
        description: 'Sky conditions, tonight\'s plan and your Astrodex activity from MyAstroBoard (MQTT connector)',
        preview: true,
        documentationURL: 'https://github.com/myastroboard/lovelace-myastroboard-card',
    });
}

console.info(`%c MYASTROBOARD-CARD %c v${CARD_VERSION} `, 'color: white; background: #1f4e79; font-weight: 700;', 'color: #1f4e79; background: white; font-weight: 700;');
