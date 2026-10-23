/* =========================================================
 * Sound Canvas (사운드 캔버스) — script.js
 *
 * 서버 없이 브라우저에서만 동작하는 배경 소리 사이트
 *  - 화면 언어: 영어 기본, 브라우저가 한국어면 한국어 (서랍에서 바꿀 수 있음)
 *  - 한 번에 한 카테고리만 재생 (다른 아이콘을 누르면 소리·배경이 함께 바뀜)
 *  - 카테고리를 누르는 순간 new Audio()로 불러오기 (지연 로딩)
 *  - 반복 지점은 크로스페이드로 이어 붙여 '툭' 끊기지 않게
 *  - 단축키는 이 탭이 활성화되어 있을 때만 (Space · M · 1~8 · Esc)
 *  - 슬립 타이머: 정한 시간이 지나면 천천히 줄이고 멈춤
 *  - 볼륨 · 선택한 트랙 · 음소거 · 언어를 localStorage에 저장
 * ========================================================= */
(() => {
  'use strict';

  /* ---------------------------------------------------------
   * 0. 설정 — 보통은 이 부분만 바꾸면 됩니다
   * ------------------------------------------------------- */
  const CONFIG = {
    // ☕ 후원 버튼이 열 주소 (예: 'https://ko-fi.com/아이디')
    // 비워 두면 버튼을 눌렀을 때 안내 문구만 보여 줍니다.
    DONATE_URL: '',

    // 처음 접속했을 때의 볼륨 (0~100)
    DEFAULT_VOLUME: 70,

    // 아무 소리도 켜지 않았을 때의 배경
    DEFAULT_BACKGROUND: 'assets/images/default_bg.webp',

    // 화면 언어: 'auto' = 브라우저가 한국어면 한국어, 그 외에는 영어 | 'en' | 'ko'
    // (방문자가 서랍에서 직접 고르면 그 선택이 우선)
    LANGUAGE: 'auto',

    // 시계: 'auto' = 방문자 지역 설정을 따름 (미국·한국은 12시간제, 영국·일본·독일 등은 24시간제)
    //       '12' = 항상 12시간제 | '24' = 항상 24시간제
    CLOCK_FORMAT: 'auto',

    // 슬립 타이머 선택지 (분)
    SLEEP_TIMER_MINUTES: [15, 30, 60, 90],

    // 페이드 시간 (밀리초)
    FADE_MS: {
      switch: 800, // 카테고리 전환 (배경 교차 페이드 0.8초와 맞춤)
      off: 800, // 켜진 아이콘을 다시 눌러 끌 때
      pause: 700, // Space 일시정지 (뚝 끊기지 않게)
      resume: 500, // Space 다시 재생
      track: 900, // 드롭다운으로 트랙을 바꿀 때
      sleep: 20000, // 슬립 타이머가 끝났을 때 (잠든 사람이 깨지 않게 아주 천천히)
    },

    // 반복 지점 크로스페이드 (초). 0으로 두면 브라우저 기본 반복(loop)을 씁니다.
    LOOP_CROSSFADE_SEC: 2.5,

    // 음악(playlist) 카테고리에서 다음 곡으로 넘어갈 때의 크로스페이드 (초)
    PLAYLIST_CROSSFADE_SEC: 3,

    // localStorage 저장 키
    STORAGE_KEY: 'sound-canvas:v1',
  };

  // 에셋 출처 표기가 필요하면 여기에 추가하세요. 비어 있으면 서랍에 나타나지 않습니다.
  // 예: { title: 'Rain on window', author: 'Someone', license: 'CC BY 4.0', url: 'https://...' }
  const CREDITS = [
    // rain_2.mp3 — CC BY 3.0이라 출처 표기가 필요합니다 (나머지 빗소리는 CC0)
    { title: 'rain1.wav (trimmed & looped)', author: 'Rocktopus', license: 'CC BY 3.0', url: 'https://freesound.org/people/Rocktopus/sounds/233434/' },
  ];

  /* ---------------------------------------------------------
   * 1. 화면 문구 (영어 · 한국어)
   *    {name} 같은 부분은 실행할 때 실제 값으로 바뀝니다.
   * ------------------------------------------------------- */
  const I18N = {
    en: {
      siteTitle: 'Sound Canvas',
      pageTitle: 'Sound Canvas — Free Ambient Sounds for Focus & Sleep',
      dockLabel: 'Choose a sound',
      nowSection: 'Current sound',
      openSettings: 'Open settings',
      closeSettings: 'Close settings',
      settings: 'Settings',
      emptyState: 'Pick a sound from the dock to set its volume and track here.',
      volume: 'Volume',
      track: 'Track',
      random: '🎲 Random',
      volumeNote: "This browser doesn't allow volume changes on this device. Use your device's volume buttons.",
      mute: 'Mute',
      mutedBadge: 'Muted',
      unmute: 'Unmute',
      sleepTimer: 'Sleep timer',
      timerOff: 'Off',
      timerOption: '{n} min',
      timerLeft: 'Stops in {time}',
      timerBadge: '{n} min',
      timerBadgeLabel: 'Sleep timer, {n} min left. Open settings',
      timerSet: 'Sound will stop in {n} minutes.',
      timerCanceled: 'Sleep timer turned off.',
      timerEnded: 'Sleep timer ended. Press Space to play again.',
      language: 'Language',
      shortcuts: 'Keyboard shortcuts',
      keyPlay: 'Play / pause',
      keyMute: 'Mute on / off',
      keyPick: 'Jump to a sound',
      keyClose: 'Close settings',
      credits: 'Credits',
      donate: '☕ Support',
      donateMissingLocal: 'No support link yet. Add one to CONFIG.DONATE_URL at the top of js/script.js.',
      donateMissing: 'The support link is coming soon.',
      status_playing: 'Playing',
      status_paused: 'Paused',
      status_loading: 'Loading',
      status_error: 'File missing',
      fileNotFound: 'Sound file not found',
      pickFirst: 'Pick a sound from the dock first.',
      loadFailed: "Couldn't load {name}. Please try again in a moment.",
      missingAll: '{name} has no sound files yet. Add files like {file} to the assets/audio folder.',
      missingOne: "Couldn't load this file: {src}",
      autoplayBlocked: 'Your browser blocked playback. Press Space to play.',
      announceOn: '{name} on',
      announceOff: '{name} off',
      announcePlay: 'Playing',
      announcePause: 'Paused',
      announceMute: 'Muted',
      announceUnmute: 'Unmuted',
      clockLabel: 'Current time {time}',
    },
    ko: {
      siteTitle: '사운드 캔버스',
      pageTitle: '사운드 캔버스 — 집중·수면을 위한 무료 빗소리·백색소음',
      dockLabel: '소리 고르기',
      nowSection: '지금 고른 소리',
      openSettings: '설정 열기',
      closeSettings: '설정 닫기',
      settings: '설정',
      emptyState: '도크에서 소리를 고르면 여기서 볼륨과 트랙을 바꿀 수 있어요.',
      volume: '볼륨',
      track: '트랙',
      random: '🎲 랜덤',
      volumeNote: '이 기기에서는 브라우저가 볼륨 조절을 막고 있어요. 기기의 볼륨 버튼을 써 주세요.',
      mute: '음소거',
      mutedBadge: '음소거 중',
      unmute: '음소거 해제',
      sleepTimer: '슬립 타이머',
      timerOff: '끄기',
      timerOption: '{n}분',
      timerLeft: '{time} 후 멈춤',
      timerBadge: '{n}분',
      timerBadgeLabel: '슬립 타이머 {n}분 남음. 설정 열기',
      timerSet: '{n}분 뒤에 소리가 멈춰요.',
      timerCanceled: '슬립 타이머를 껐어요.',
      timerEnded: '슬립 타이머가 끝나 소리를 멈췄어요. Space를 누르면 다시 재생돼요.',
      language: '언어',
      shortcuts: '단축키',
      keyPlay: '재생 / 일시정지',
      keyMute: '음소거 켜고 끄기',
      keyPick: '소리 바로 고르기',
      keyClose: '설정 닫기',
      credits: '에셋 출처',
      donate: '☕ 후원하기',
      donateMissingLocal: '후원 링크가 아직 없어요. js/script.js 맨 위 CONFIG.DONATE_URL에 주소를 넣어 주세요.',
      donateMissing: '후원 링크를 준비하고 있어요.',
      status_playing: '재생 중',
      status_paused: '일시정지',
      status_loading: '불러오는 중',
      status_error: '파일 없음',
      fileNotFound: '소리 파일을 찾을 수 없어요',
      pickFirst: '아래 도크에서 소리를 먼저 골라 주세요.',
      loadFailed: '{name} 파일을 불러오지 못했어요. 잠시 후 다시 눌러 주세요.',
      missingAll: '{name} 파일이 아직 없어요. assets/audio 폴더에 {file} 같은 파일을 넣어 주세요.',
      missingOne: '이 파일을 불러오지 못했어요: {src}',
      autoplayBlocked: '브라우저가 소리 재생을 막았어요. Space를 누르면 재생돼요.',
      announceOn: '{name} 켬',
      announceOff: '{name} 끔',
      announcePlay: '재생',
      announcePause: '일시정지',
      announceMute: '음소거',
      announceUnmute: '음소거 해제',
      clockLabel: '현재 시각 {time}',
    },
  };

  /* ---------------------------------------------------------
   * 2. 데이터 — 8개 카테고리 × 3~4개 트랙 (JSON 배열)
   *
   *  · 무료 에셋을 받으면 같은 경로·같은 이름으로 덮어쓰기만 하면 됩니다.
   *  · 파일 이름은 모두 소문자로 (GitHub Pages는 대소문자를 구분합니다).
   *  · name / title: { "en": 영어, "ko": 한국어 } — 한 언어만 쓰려면 그냥 문자열도 됩니다.
   *  · background: 카테고리마다 움직이는 픽셀 아트 1개 (webp/gif 모두 가능)
   *  · sky: 배경 그림이 없을 때 보여 줄 하늘색 [위, 아래]
   *  · playMode: "loop" = 고른 트랙 하나를 계속 반복
   *              "playlist" = 곡이 끝나면 같은 카테고리의 다른 곡으로
   * ------------------------------------------------------- */
  const SOUND_DATA = [
    {
      "id": "rain",
      "name": { "en": "Rain", "ko": "빗소리" },
      "icon": "🌧️",
      "accent": "#8EC5FF",
      "sky": ["#0B1626", "#24405F"],
      "background": "assets/images/rain_bg.webp",
      "playMode": "loop",
      "tracks": [
        { "id": "rain_1", "title": { "en": "Rain on the window", "ko": "창가에 내리는 비" }, "src": "assets/audio/rain_1.mp3" },
        { "id": "rain_2", "title": { "en": "Rain on a tent", "ko": "텐트 위 빗소리" }, "src": "assets/audio/rain_2.mp3" },
        { "id": "rain_3", "title": { "en": "Rain on the windowsill", "ko": "창틀에 떨어지는 비" }, "src": "assets/audio/rain_3.mp3" },
        { "id": "rain_4", "title": { "en": "Light rain", "ko": "잔잔한 비" }, "src": "assets/audio/rain_4.mp3" }
      ]
    },
    {
      "id": "fire",
      "name": { "en": "Fire", "ko": "불" },
      "icon": "🔥",
      "accent": "#FF9A4D",
      "sky": ["#170C0A", "#4A2014"],
      "background": "assets/images/fire_bg.webp",
      "playMode": "loop",
      "tracks": [
        { "id": "fire_1", "title": { "en": "Crackling campfire", "ko": "타닥타닥 모닥불" }, "src": "assets/audio/fire_1.mp3" },
        { "id": "fire_2", "title": { "en": "Fireplace", "ko": "벽난로" }, "src": "assets/audio/fire_2.mp3" },
        { "id": "fire_3", "title": { "en": "Campfire and crickets", "ko": "캠프파이어와 풀벌레" }, "src": "assets/audio/fire_3.mp3" }
      ]
    },
    {
      "id": "nature",
      "name": { "en": "Nature", "ko": "자연" },
      "icon": "🌿",
      "accent": "#9BE07A",
      "sky": ["#0A1712", "#22452C"],
      "background": "assets/images/nature_bg.webp",
      "playMode": "loop",
      "tracks": [
        { "id": "nature_1", "title": { "en": "Birds at dawn", "ko": "새벽 숲 새소리" }, "src": "assets/audio/nature_1.mp3" },
        { "id": "nature_2", "title": { "en": "Summer night insects", "ko": "여름밤 풀벌레" }, "src": "assets/audio/nature_2.mp3" },
        { "id": "nature_3", "title": { "en": "Wind over the meadow", "ko": "바람 부는 들판" }, "src": "assets/audio/nature_3.mp3" },
        { "id": "nature_4", "title": { "en": "Frogs in the rice field", "ko": "개구리 우는 논" }, "src": "assets/audio/nature_4.mp3" }
      ]
    },
    {
      "id": "cafe",
      "name": { "en": "Cafe", "ko": "카페" },
      "icon": "☕",
      "accent": "#E8B98A",
      "sky": ["#160F0C", "#47301F"],
      "background": "assets/images/cafe_bg.webp",
      "playMode": "loop",
      "tracks": [
        { "id": "cafe_1", "title": { "en": "Quiet afternoon cafe", "ko": "조용한 오후 카페" }, "src": "assets/audio/cafe_1.mp3" },
        { "id": "cafe_2", "title": { "en": "Busy cafe", "ko": "북적이는 카페" }, "src": "assets/audio/cafe_2.mp3" },
        { "id": "cafe_3", "title": { "en": "Typing in the cafe", "ko": "키보드 소리 나는 카페" }, "src": "assets/audio/cafe_3.mp3" }
      ]
    },
    {
      "id": "water",
      "name": { "en": "Water", "ko": "물" },
      "icon": "🌊",
      "accent": "#5FE3D0",
      "sky": ["#071821", "#0F4650"],
      "background": "assets/images/water_bg.webp",
      "playMode": "loop",
      "tracks": [
        { "id": "water_1", "title": { "en": "Babbling brook", "ko": "졸졸 시냇물" }, "src": "assets/audio/water_1.mp3" },
        { "id": "water_2", "title": { "en": "Gentle waves", "ko": "잔잔한 파도" }, "src": "assets/audio/water_2.mp3" },
        { "id": "water_3", "title": { "en": "Distant waterfall", "ko": "멀리서 들리는 폭포" }, "src": "assets/audio/water_3.mp3" },
        { "id": "water_4", "title": { "en": "Water droplets", "ko": "똑똑 떨어지는 물방울" }, "src": "assets/audio/water_4.mp3" }
      ]
    },
    {
      "id": "whitenoise",
      "name": { "en": "White Noise", "ko": "백색소음" },
      "icon": "📻",
      "accent": "#D3D7EA",
      "sky": ["#101119", "#30323F"],
      "background": "assets/images/whitenoise_bg.webp",
      "playMode": "loop",
      "tracks": [
        { "id": "whitenoise_1", "title": { "en": "White noise", "ko": "화이트 노이즈" }, "src": "assets/audio/whitenoise_1.mp3" },
        { "id": "whitenoise_2", "title": { "en": "Pink noise", "ko": "핑크 노이즈" }, "src": "assets/audio/whitenoise_2.mp3" },
        { "id": "whitenoise_3", "title": { "en": "Brown noise", "ko": "브라운 노이즈" }, "src": "assets/audio/whitenoise_3.mp3" }
      ]
    },
    {
      "id": "workspace",
      "name": { "en": "Workspace", "ko": "작업" },
      "icon": "⌨️",
      "accent": "#B7A4FF",
      "sky": ["#100E1E", "#2E2752"],
      "background": "assets/images/workspace_bg.webp",
      "playMode": "loop",
      "tracks": [
        { "id": "workspace_1", "title": { "en": "Keyboard typing", "ko": "키보드 타이핑" }, "src": "assets/audio/workspace_1.mp3" },
        { "id": "workspace_2", "title": { "en": "Quiet office", "ko": "조용한 사무실" }, "src": "assets/audio/workspace_2.mp3" },
        { "id": "workspace_3", "title": { "en": "Library", "ko": "도서관" }, "src": "assets/audio/workspace_3.mp3" },
        { "id": "workspace_4", "title": { "en": "Pencil on paper", "ko": "연필로 필기하는 소리" }, "src": "assets/audio/workspace_4.mp3" },
        { "id": "workspace_5", "title": { "en": "Deep mechanical keyboard", "ko": "묵직한 기계식 키보드" }, "src": "assets/audio/workspace_5.mp3" }
      ]
    },
    {
      "id": "lofi",
      "name": { "en": "Lofi", "ko": "음악" },
      "icon": "🎧",
      "accent": "#FF8FBF",
      "sky": ["#160C1E", "#4A2147"],
      "background": "assets/images/lofi_bg.webp",
      "playMode": "playlist",
      "tracks": [
        { "id": "lofi_1", "title": { "en": "Ease into Night", "ko": "Ease into Night (밤으로 스며들기)" }, "src": "assets/audio/lofi_1.mp3" },
        { "id": "lofi_2", "title": { "en": "Calm Currents", "ko": "Calm Currents (잔잔한 물결)" }, "src": "assets/audio/lofi_2.mp3" },
        { "id": "lofi_3", "title": { "en": "Moon Unit", "ko": "Moon Unit (달의 조각)" }, "src": "assets/audio/lofi_3.mp3" }
      ]
    }
  ];

  // 아무 소리도 켜지 않았을 때의 장면
  const DEFAULT_SCENE = { accent: '#FFC86B', sky: ['#0D1124', '#272B4F'], stars: true };

  /* ---------------------------------------------------------
   * 3. 도우미
   * ------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const pad2 = (n) => String(n).padStart(2, '0');
  const byId = new Map(SOUND_DATA.map((cat) => [cat.id, cat]));
  const fileName = (path) => String(path).split('/').pop();

  const Ease = {
    linear: (t) => t,
    inOut: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    sineIn: (t) => 1 - Math.cos((t * Math.PI) / 2), // 페이드 아웃 (등전력 곡선)
    sineOut: (t) => Math.sin((t * Math.PI) / 2), // 페이드 인 (등전력 곡선)
  };

  // 내 컴퓨터에서 열었을 때만 개발용 안내(파일 경로 등)를 보여 준다
  const IS_LOCAL =
    location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  const REDUCED_MOTION =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 아이폰·아이패드처럼 스크립트로 볼륨을 바꿀 수 없는 환경 감지 (값을 넣어도 항상 1로 읽힘)
  const CAN_SET_VOLUME = (() => {
    try {
      const probe = document.createElement('audio');
      probe.volume = 0.5;
      return Math.abs(probe.volume - 0.5) < 0.01;
    } catch (err) {
      return false;
    }
  })();

  // 슬라이더 값(0~100) → 실제 음량. 제곱 곡선이라 50%가 귀에 '절반쯤'으로 들린다.
  const volumeToGain = (percent) => Math.pow(clamp(percent, 0, 100) / 100, 2);

  function hexToRgba(hex, alpha) {
    const match = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!match) return hex;
    const n = parseInt(match[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
  }

  // 남은 시간 표시: 29:41 / 1:29:41
  function formatDuration(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`;
  }

  /* ---------------------------------------------------------
   * 4. 언어
   * ------------------------------------------------------- */
  let LANG = 'en';

  // 화면 문구 가져오기
  function t(key, vars) {
    const table = I18N[LANG] || I18N.en;
    let text = key in table ? table[key] : key in I18N.en ? I18N.en[key] : key;
    if (vars) text = text.replace(/\{(\w+)\}/g, (all, name) => (name in vars ? String(vars[name]) : all));
    return text;
  }

  // 데이터 문구 가져오기: { en, ko } 객체 또는 문자열
  function L(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[LANG] || value.en || Object.values(value)[0] || '';
  }

  function detectLanguage() {
    const chosen = Store.data.lang || (CONFIG.LANGUAGE !== 'auto' ? CONFIG.LANGUAGE : null);
    if (chosen && I18N[chosen]) return chosen;
    const list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en'];
    return /^ko\b/i.test(String(list[0] || '')) ? 'ko' : 'en';
  }

  function setLanguage(lang) {
    if (!I18N[lang]) return;
    Store.data.lang = lang; // 방문자가 직접 고른 언어는 다음 접속에도 유지
    Store.save();
    if (lang === LANG) {
      UI.renderLanguageButtons();
      return;
    }
    LANG = lang;
    applyLanguage();
  }

  // 화면 전체에 현재 언어 적용
  function applyLanguage() {
    document.documentElement.lang = LANG;
    document.title = t('pageTitle');
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });
    UI.relabel();
    Clock.refresh();
    UI.render();
    UI.renderTimer();
  }

  /* ---------------------------------------------------------
   * 5. 트윈 — 값을 시간에 따라 부드럽게 바꾼다 (볼륨 페이드용)
   *    화면이 보일 땐 requestAnimationFrame, 탭이 뒤로 가면 타이머로 진행해서
   *    다른 탭을 보고 있어도 페이드와 반복 크로스페이드가 멈추지 않는다.
   * ------------------------------------------------------- */
  const Tween = (() => {
    const active = new Map();
    const ids = new WeakMap();
    let seq = 0;
    let scheduled = false;
    let rafId = 0;
    let timerId = 0;

    const keyOf = (target, prop) => {
      if (!ids.has(target)) ids.set(target, ++seq);
      return `${ids.get(target)}:${prop}`;
    };

    function schedule() {
      if (scheduled) return;
      scheduled = true;
      const run = () => {
        if (!scheduled) return;
        scheduled = false;
        cancelAnimationFrame(rafId);
        clearTimeout(timerId);
        tick(performance.now());
      };
      rafId = document.hidden ? 0 : requestAnimationFrame(run);
      timerId = setTimeout(run, document.hidden ? 20 : 50);
    }

    function tick(now) {
      active.forEach((tw, key) => {
        const p = clamp((now - tw.start) / tw.duration, 0, 1);
        tw.target[tw.prop] = tw.from + (tw.to - tw.from) * tw.ease(p);
        if (tw.onUpdate) tw.onUpdate(tw.target[tw.prop]);
        if (p >= 1 && active.get(key) === tw) {
          active.delete(key);
          if (tw.onComplete) tw.onComplete();
        }
      });
      if (active.size) schedule();
    }

    // 같은 대상·속성의 이전 트윈은 취소된다 (그 onComplete는 불리지 않음)
    function to(target, prop, value, duration, options) {
      const opts = options || {};
      const key = keyOf(target, prop);
      active.delete(key);
      if (!(duration > 0) || target[prop] === value) {
        target[prop] = value;
        if (opts.onUpdate) opts.onUpdate(value);
        if (opts.onComplete) opts.onComplete();
        return;
      }
      active.set(key, {
        target,
        prop,
        from: target[prop],
        to: value,
        duration,
        start: performance.now(),
        ease: opts.ease || Ease.inOut,
        onUpdate: opts.onUpdate,
        onComplete: opts.onComplete,
      });
      schedule();
    }

    function cancel(target, prop) {
      if (ids.has(target)) active.delete(`${ids.get(target)}:${prop}`);
    }

    return { to, cancel };
  })();

  /* ---------------------------------------------------------
   * 6. 저장소 (localStorage) — 볼륨 · 선택한 트랙 · 음소거 · 언어
   * ------------------------------------------------------- */
  const Store = {
    data: { volumes: {}, tracks: {}, muted: false, lang: null },
    timer: 0,

    load() {
      let saved = null;
      try {
        saved = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || 'null');
      } catch (err) {
        saved = null; // 저장소를 쓸 수 없거나 값이 깨졌으면 기본값으로
      }
      if (!saved || typeof saved !== 'object') return;
      SOUND_DATA.forEach((cat) => {
        const volume = Number(saved.volumes && saved.volumes[cat.id]);
        if (Number.isFinite(volume)) this.data.volumes[cat.id] = clamp(Math.round(volume), 0, 100);
        const choice = saved.tracks && saved.tracks[cat.id];
        if (choice === 'random' || cat.tracks.some((tr) => tr.id === choice)) {
          this.data.tracks[cat.id] = choice;
        }
      });
      this.data.muted = saved.muted === true;
      if (I18N[saved.lang]) this.data.lang = saved.lang;
    },

    save() {
      clearTimeout(this.timer);
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.data));
      } catch (err) {
        /* 사생활 보호 모드 등 저장할 수 없는 환경 — 저장 없이 계속 동작 */
      }
    },

    // 슬라이더를 끄는 동안에는 잠깐 모았다가 저장
    saveSoon() {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.save(), 150);
    },

    volume(catId) {
      const v = this.data.volumes[catId];
      return Number.isFinite(v) ? v : CONFIG.DEFAULT_VOLUME;
    },

    trackChoice(catId) {
      return this.data.tracks[catId] || 'random';
    },
  };

  /* ---------------------------------------------------------
   * 7. 상태
   * ------------------------------------------------------- */
  const state = {
    activeId: null, // 켜진 카테고리
    player: null, // 지금 소리를 맡은 플레이어
    paused: false, // Space로 일시정지한 상태
    lastRandom: {}, // 카테고리별 마지막 랜덤 트랙 (같은 곡 연속 방지)
    failed: new Set(), // 이번 접속에서 불러오지 못한 파일
    drawerOpen: false,
  };

  const liveVoices = new Set(); // 지금 살아 있는 모든 오디오 (음소거 일괄 적용용)

  /* ---------------------------------------------------------
   * 8. 오디오
   * ------------------------------------------------------- */

  // 8-1. 다 쓴 Audio를 잠시 보관했다가 같은 파일에 다시 쓴다 (다시 내려받지 않게)
  const AudioPool = {
    idle: new Map(),
    order: [],
    MAX_IDLE: 6,

    acquire(src) {
      const list = this.idle.get(src);
      if (list && list.length) {
        const el = list.pop();
        this.order = this.order.filter((x) => x !== el);
        return el;
      }
      // 지연 로딩: 카테고리를 누르는 이 순간에 처음 만들어 내려받기 시작
      const el = new Audio(src);
      el.preload = 'auto';
      return el;
    },

    release(el) {
      try {
        el.pause();
      } catch (err) {
        /* 무시 */
      }
      el.loop = false;
      const src = el.getAttribute('src');
      if (el.error || !src) {
        this.discard(el);
        return;
      }
      try {
        if (el.currentTime !== 0) el.currentTime = 0;
      } catch (err) {
        /* 무시 */
      }
      if (!this.idle.has(src)) this.idle.set(src, []);
      this.idle.get(src).push(el);
      this.order.push(el);
      while (this.order.length > this.MAX_IDLE) {
        const oldest = this.order.shift();
        const list = this.idle.get(oldest.getAttribute('src'));
        if (list) list.splice(list.indexOf(oldest), 1);
        this.discard(oldest);
      }
    },

    discard(el) {
      try {
        el.removeAttribute('src');
        el.load(); // 내려받던 데이터 해제
      } catch (err) {
        /* 무시 */
      }
    },
  };

  // 8-2. 트랙 고르기 (지정한 트랙 > 랜덤, 불러오지 못한 파일은 랜덤에서 제외)
  function pickTrack(cat, excludeId) {
    const choice = Store.trackChoice(cat.id);
    if (!excludeId && choice !== 'random') {
      const fixed = cat.tracks.find((t) => t.id === choice);
      if (fixed) return fixed;
    }
    const available = cat.tracks.filter((t) => !state.failed.has(t.src));
    const pool = available.length ? available : cat.tracks;
    let options = pool.filter((t) => t.id !== excludeId && t.id !== state.lastRandom[cat.id]);
    if (!options.length) options = pool.filter((t) => t.id !== excludeId);
    if (!options.length) options = pool;
    const pick = options[Math.floor(Math.random() * options.length)];
    state.lastRandom[cat.id] = pick.id;
    return pick;
  }

  // 8-3. 플레이어: 트랙 하나를 맡아 재생 · 페이드 · 반복 크로스페이드를 처리
  class TrackPlayer {
    constructor(category, track) {
      this.category = category;
      this.track = track;
      this.level = 0; // 페이드 값 0~1 (볼륨 설정과 곱해짐)
      this.voices = []; // 재생 중인 오디오 (크로스페이드 동안은 2개)
      this.current = null; // 주로 들리는 오디오
      this.status = 'idle'; // idle → loading → playing ⇄ paused → stopping → stopped | error
      this.buffering = false;
      this.xfading = false;
      this.xf = null;
      this.xfToken = 0;
      this.crossfadeBlocked = false;
      this.startOnResume = false;
      this.mode = this.resolveMode();
    }

    // 음악 카테고리를 '랜덤'으로 들으면 곡이 끝날 때 다른 곡으로, 그 외에는 한 곡 반복
    resolveMode() {
      const random = Store.trackChoice(this.category.id) === 'random';
      return this.category.playMode === 'playlist' && random ? 'playlist' : 'loop';
    }

    setMode(mode) {
      this.mode = mode;
      if (this.current && !this.xfading) this.current.el.loop = this.wantsNativeLoop();
    }

    wantsNativeLoop() {
      return this.mode === 'loop' && !(CONFIG.LOOP_CROSSFADE_SEC > 0);
    }

    /* ----- 볼륨 ----- */
    apply() {
      if (!CAN_SET_VOLUME) return;
      const base = volumeToGain(Store.volume(this.category.id)) * this.level;
      this.voices.forEach((voice) => {
        const volume = clamp(base * voice.mix, 0, 1);
        if (Math.abs(voice.el.volume - volume) > 0.0005) voice.el.volume = volume;
      });
    }

    fadeTo(level, ms, ease, onDone) {
      Tween.to(this, 'level', level, CAN_SET_VOLUME ? ms : 0, {
        ease,
        onUpdate: () => this.apply(),
        onComplete: onDone,
      });
    }

    /* ----- 오디오 하나(voice) ----- */
    makeVoice(track) {
      const el = AudioPool.acquire(track.src);
      const voice = { el, track, mix: 1, released: false, events: new AbortController() };
      el.muted = Store.data.muted;
      el.loop = this.wantsNativeLoop();
      if (CAN_SET_VOLUME) el.volume = 0;
      const on = (type, handler) => el.addEventListener(type, handler, { signal: voice.events.signal });
      on('timeupdate', () => this.onTimeUpdate(voice));
      on('ended', () => this.onEnded(voice));
      on('error', () => this.onError(voice));
      on('waiting', () => this.setBuffering(voice, true));
      on('playing', () => this.setBuffering(voice, false));
      on('pause', () => this.onElementPause(voice));
      on('play', () => this.onElementPlay(voice));
      liveVoices.add(voice);
      return voice;
    }

    dropVoice(voice) {
      if (voice.released) return;
      voice.released = true;
      voice.events.abort(); // 이벤트 연결 해제 → 이후 pause를 '외부 일시정지'로 오해하지 않음
      liveVoices.delete(voice);
      this.voices = this.voices.filter((v) => v !== voice);
      if (this.current === voice) this.current = this.voices[0] || null;
      AudioPool.release(voice.el);
    }

    dropAll() {
      this.voices.slice().forEach((voice) => this.dropVoice(voice));
    }

    // play()는 Promise를 돌려준다 — 실패 원인에 따라 처리
    play(voice) {
      let promise;
      try {
        promise = voice.el.play();
      } catch (err) {
        return Promise.resolve(this.onPlayRejected(voice, err));
      }
      if (!promise || typeof promise.then !== 'function') return Promise.resolve(!voice.released);
      return promise.then(
        () => !voice.released,
        (err) => this.onPlayRejected(voice, err)
      );
    }

    onPlayRejected(voice, err) {
      if (voice.released) return false;
      const name = err && err.name;
      if (name === 'AbortError') return false; // pause()로 중단된 것 — 정상
      if (voice !== this.current) {
        // 반복 크로스페이드용 오디오가 실패 → 지금 소리는 그대로 두고 브라우저 기본 반복으로
        if (name === 'NotAllowedError') this.crossfadeBlocked = true;
        else this.markFailed(voice.track);
        return false;
      }
      if (name === 'NotAllowedError') {
        // 브라우저 자동 재생 정책에 막힘 → 일시정지 상태로 두고 Space로 다시 시작
        this.status = 'paused';
        this.startOnResume = true;
        Engine.onAutoplayBlocked(this);
        return false;
      }
      this.fail(voice);
      return false;
    }

    markFailed(track) {
      if (!state.failed.has(track.src)) {
        state.failed.add(track.src);
        console.warn('[Sound Canvas] Could not load sound file:', track.src);
      }
    }

    /* ----- 재생 흐름 ----- */
    start(ms) {
      if (this.status !== 'idle') return;
      this.status = 'loading';
      const voice = this.makeVoice(this.track);
      this.voices = [voice];
      this.current = voice;
      this.level = 0;
      this.apply();
      Engine.onPlayerChange(this);
      this.play(voice).then((ok) => {
        if (!ok || this.status !== 'loading') return;
        this.status = 'playing';
        Engine.onPlayerChange(this);
        this.fadeTo(1, ms, Ease.sineOut);
      });
    }

    pause(ms) {
      if (this.status === 'idle') return;
      if (this.status === 'loading') {
        // 아직 소리가 나기 전 → 바로 멈추고, 다시 재생할 때 시작
        this.startOnResume = true;
        this.status = 'paused';
        if (this.current) this.current.el.pause();
        Engine.onPlayerChange(this);
        return;
      }
      if (this.status !== 'playing') return;
      this.status = 'paused';
      this.settleCrossfade();
      Engine.onPlayerChange(this);
      // 소리가 뚝 끊기지 않게 줄인 뒤 멈춘다
      this.fadeTo(0, ms, Ease.sineIn, () => {
        if (this.status === 'paused') this.voices.forEach((voice) => voice.el.pause());
      });
    }

    resume(ms) {
      if (this.status === 'idle') {
        this.start(ms);
        return;
      }
      if (this.status !== 'paused') return;
      const voice = this.current;
      if (!voice) {
        this.status = 'idle';
        this.start(ms);
        return;
      }
      this.status = this.startOnResume ? 'loading' : 'playing';
      this.startOnResume = false;
      Engine.onPlayerChange(this);
      this.play(voice).then((ok) => {
        if (!ok) return;
        if (this.status === 'loading') {
          this.status = 'playing';
          Engine.onPlayerChange(this);
        }
        if (this.status === 'playing') this.fadeTo(1, ms, Ease.sineOut);
      });
    }

    stop(ms) {
      if (this.status === 'stopping' || this.status === 'stopped') return;
      const audible = this.level > 0.001 && this.voices.some((voice) => !voice.el.paused);
      this.status = 'stopping';
      if (!audible || !(ms > 0) || !CAN_SET_VOLUME) {
        this.destroy();
        return;
      }
      this.fadeTo(0, ms, Ease.sineIn, () => this.destroy());
    }

    destroy() {
      this.status = 'stopped';
      this.cancelTweens();
      this.dropAll();
    }

    fail(voice) {
      if (this.status === 'error' || this.status === 'stopped') return;
      this.markFailed(voice.track);
      this.cancelTweens();
      this.dropAll();
      this.status = 'error';
      Engine.onPlayerError(this, voice.track);
    }

    cancelTweens() {
      Tween.cancel(this, 'level');
      if (this.xf) Tween.cancel(this.xf.mixer, 't');
      this.xf = null;
      this.xfading = false;
    }

    /* ----- 반복 · 다음 곡: 끝나기 직전에 다음 오디오를 겹쳐 틀며 크로스페이드 ----- */
    onTimeUpdate(voice) {
      if (voice !== this.current || this.status !== 'playing' || this.xfading || this.crossfadeBlocked) return;
      const el = voice.el;
      const duration = el.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;
      const xfSec = this.mode === 'playlist' ? CONFIG.PLAYLIST_CROSSFADE_SEC : CONFIG.LOOP_CROSSFADE_SEC;
      if (!(xfSec > 0)) return;
      if (duration < xfSec * 3) {
        // 아주 짧은 파일은 크로스페이드 대신 브라우저 기본 반복
        if (this.mode === 'loop') el.loop = true;
        return;
      }
      const remaining = duration - el.currentTime;
      if (remaining <= xfSec + 0.35) this.beginCrossfade(voice, remaining, xfSec);
    }

    beginCrossfade(outVoice, remaining, xfSec) {
      this.xfading = true;
      const token = ++this.xfToken;
      outVoice.el.loop = true; // 크로스페이드 도중 끝에 닿아도 소리가 비지 않게
      const nextTrack = this.mode === 'playlist' ? pickTrack(this.category, this.track.id) : this.track;
      const inVoice = this.makeVoice(nextTrack);
      inVoice.mix = 0;
      this.voices.push(inVoice);
      this.apply();
      const ms = Math.round(clamp(remaining - 0.05, 0.4, xfSec) * 1000);

      this.play(inVoice).then((ok) => {
        if (token !== this.xfToken) return; // 그 사이 새 크로스페이드가 시작됨
        if (inVoice.released || !ok || this.status !== 'playing') {
          // 다음 파일이 없거나 그 사이 멈췄으면 → 지금 소리를 그대로 이어서 반복하고,
          // 다음 반복 지점에서 다시 시도한다
          this.dropVoice(inVoice);
          this.xfading = false;
          return;
        }
        this.current = inVoice;
        if (nextTrack !== this.track) {
          this.track = nextTrack;
          Engine.onPlayerChange(this);
        }
        const mixer = { t: 0 };
        this.xf = { mixer, outVoice, inVoice };
        Tween.to(mixer, 't', 1, ms, {
          ease: Ease.linear,
          onUpdate: (t) => {
            // 등전력 크로스페이드: 두 소리를 합친 크기가 일정하게 유지된다
            outVoice.mix = Math.cos((t * Math.PI) / 2);
            inVoice.mix = Math.sin((t * Math.PI) / 2);
            this.apply();
          },
          onComplete: () => {
            this.dropVoice(outVoice);
            this.xf = null;
            this.xfading = false;
          },
        });
      });
    }

    // 일시정지할 때 진행 중인 크로스페이드를 바로 마무리
    settleCrossfade() {
      if (!this.xfading) return;
      if (this.xf) {
        const { mixer, outVoice, inVoice } = this.xf;
        Tween.cancel(mixer, 't');
        inVoice.mix = 1;
        this.dropVoice(outVoice);
        this.xf = null;
      } else {
        // 다음 오디오가 아직 시작 전 → 그 오디오는 버리고 지금 오디오 유지
        this.voices.filter((v) => v !== this.current).forEach((v) => this.dropVoice(v));
      }
      this.xfading = false;
      this.apply();
    }

    onEnded(voice) {
      if (voice.released) return;
      if (voice !== this.current) {
        this.dropVoice(voice);
        return;
      }
      if (this.status !== 'playing') return;
      if (this.mode === 'loop') {
        voice.el.currentTime = 0; // 안전장치: 처음부터 다시
        this.play(voice);
      } else {
        this.advance();
      }
    }

    // 크로스페이드 없이 바로 다음 곡 (짧은 곡이거나 크로스페이드를 못 한 경우)
    advance() {
      const next = pickTrack(this.category, this.track.id);
      const previous = this.current;
      const voice = this.makeVoice(next);
      this.voices.push(voice);
      this.current = voice;
      if (previous) this.dropVoice(previous);
      this.track = next;
      this.apply();
      Engine.onPlayerChange(this);
      this.play(voice);
    }

    /* ----- 이벤트 ----- */
    onError(voice) {
      if (voice.released) return;
      if (voice === this.current && this.status !== 'stopping') {
        this.fail(voice);
        return;
      }
      this.markFailed(voice.track);
      this.dropVoice(voice);
    }

    setBuffering(voice, on) {
      if (voice !== this.current || this.buffering === on) return;
      this.buffering = on;
      Engine.onPlayerChange(this);
    }

    // 우리가 멈춘 게 아닌데 멈췄다면 (다른 앱이 오디오를 가져가는 등) 상태를 맞춘다
    onElementPause(voice) {
      if (voice.released || voice !== this.current || voice.el.ended) return;
      if (this.status === 'playing') Engine.onExternalPause(this);
    }

    onElementPlay(voice) {
      if (voice.released || voice !== this.current) return;
      if (this.status === 'paused') Engine.onExternalPlay(this);
    }
  }

  // 8-4. 엔진: 화면 조작을 오디오 · 배경 · 저장으로 연결
  const Engine = {
    // 도크 아이콘을 눌렀을 때 (켜진 아이콘이면 끄기)
    activate(id) {
      const cat = byId.get(id);
      if (!cat) return;
      if (state.activeId === id) {
        this.turnOff();
        return;
      }
      const previous = state.player;
      const player = new TrackPlayer(cat, pickTrack(cat)); // Math.random으로 트랙 고르기
      state.activeId = id;
      state.player = player;
      state.paused = false;
      player.start(CONFIG.FADE_MS.switch);
      if (previous) previous.stop(CONFIG.FADE_MS.switch);
      Scene.show(cat);
      UI.render();
      UI.announce(t('announceOn', { name: L(cat.name) }));
    },

    turnOff() {
      const previous = state.player;
      state.activeId = null;
      state.player = null;
      state.paused = false;
      if (previous) previous.stop(CONFIG.FADE_MS.off);
      Scene.show(null);
      UI.render();
      if (previous) UI.announce(t('announceOff', { name: L(previous.category.name) }));
    },

    togglePause() {
      const player = state.player;
      if (!player) {
        Toast.show(t('pickFirst'));
        return;
      }
      if (player.status === 'error') {
        Toast.show(missingMessage(player.category, player.track), 'error', 5200);
        return;
      }
      if (state.paused) {
        state.paused = false;
        player.resume(CONFIG.FADE_MS.resume);
        OSD.show('play');
        UI.announce(t('announcePlay'));
      } else {
        state.paused = true;
        player.pause(CONFIG.FADE_MS.pause);
        OSD.show('pause');
        UI.announce(t('announcePause'));
      }
      UI.render();
    },

    // 음소거는 muted 속성만 바꾸므로 원래 볼륨 값은 그대로 기억된다
    setMuted(muted, quiet) {
      Store.data.muted = muted;
      Store.save();
      liveVoices.forEach((voice) => {
        voice.el.muted = muted;
      });
      if (!quiet) OSD.show(muted ? 'mute' : 'unmute');
      UI.announce(t(muted ? 'announceMute' : 'announceUnmute'));
      UI.render();
    },

    toggleMute() {
      this.setMuted(!Store.data.muted, false);
    },

    setVolume(catId, value) {
      Store.data.volumes[catId] = clamp(Math.round(value), 0, 100);
      Store.saveSoon();
      // 음소거 중에 볼륨을 올리면 음소거를 푼다
      if (Store.data.muted && value > 0) this.setMuted(false, true);
      if (state.player && state.player.category.id === catId) state.player.apply();
      UI.renderVolume();
    },

    selectTrack(catId, value) {
      const cat = byId.get(catId);
      if (!cat) return;
      Store.data.tracks[catId] = value;
      Store.save();
      const player = state.player;
      if (!player || player.category.id !== catId) {
        UI.render();
        return;
      }
      if (value === 'random') {
        // 지금 곡은 그대로 두고, 음악 카테고리는 곡이 끝나면 랜덤으로 이어서
        player.setMode(player.resolveMode());
        UI.render();
        return;
      }
      const track = cat.tracks.find((t) => t.id === value);
      if (!track) return;
      if (player.track.id === track.id && player.status !== 'error') {
        player.setMode('loop'); // 지금 곡을 고정 → 이 곡만 반복
        UI.render();
        return;
      }
      state.failed.delete(track.src); // 직접 고른 파일은 다시 시도 (방금 넣었을 수도 있으니)
      const next = new TrackPlayer(cat, track);
      state.player = next;
      if (state.paused) {
        player.stop(0); // 일시정지 중이면 조용히 바꿔 두고, Space를 누르면 새 트랙으로 시작
      } else {
        next.start(CONFIG.FADE_MS.track);
        player.stop(CONFIG.FADE_MS.track);
      }
      UI.render();
    },

    onPlayerChange(player) {
      if (player === state.player) UI.render();
    },

    onPlayerError(player, track) {
      if (player !== state.player) return;
      const cat = player.category;
      // 랜덤 재생이면 불러올 수 있는 다른 트랙으로 다시 시도
      const canRetry =
        Store.trackChoice(cat.id) === 'random' && cat.tracks.some((t) => !state.failed.has(t.src));
      if (canRetry) {
        const next = new TrackPlayer(cat, pickTrack(cat));
        state.player = next;
        next.start(CONFIG.FADE_MS.switch);
        UI.render();
        return;
      }
      state.paused = false;
      UI.render();
      UI.flashError(cat.id);
      Toast.show(missingMessage(cat, track), 'error', 5200);
    },

    onAutoplayBlocked(player) {
      if (player !== state.player) return;
      state.paused = true;
      UI.render();
      Toast.show(t('autoplayBlocked'));
    },

    onExternalPause(player) {
      if (player !== state.player) return;
      player.status = 'paused';
      player.settleCrossfade();
      player.voices.forEach((voice) => {
        if (!voice.el.paused) voice.el.pause();
      });
      Tween.cancel(player, 'level');
      player.level = 0;
      player.apply();
      state.paused = true;
      UI.render();
    },

    onExternalPlay(player) {
      if (player !== state.player) return;
      state.paused = false;
      player.status = 'playing';
      player.fadeTo(1, CONFIG.FADE_MS.resume, Ease.sineOut);
      UI.render();
    },
  };

  function missingMessage(cat, track) {
    const name = L(cat.name);
    if (!IS_LOCAL) return t('loadFailed', { name });
    const allMissing = cat.tracks.every((x) => state.failed.has(x.src));
    if (allMissing) return t('missingAll', { name, file: fileName(cat.tracks[0].src) });
    return t('missingOne', { src: track.src });
  }

  /* ---------------------------------------------------------
   * 9. 배경 장면 — 이전 배경 위에 새 레이어를 덮으며 교차 페이드
   * ------------------------------------------------------- */
  const SVG_NS = 'http://www.w3.org/2000/svg';

  // 배경 그림이 없을 때 쓰는 픽셀 지평선 · 별 (한 번 만들어 복제)
  const PixelArt = (() => {
    let horizon = null;
    let stars = null;
    const random = (seed) => () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    function ridge(rand, width, height, base, amp, step) {
      let y = base;
      let d = `M0 ${height}V${y}`;
      for (let x = 0; x < width; x += step) {
        d += `H${Math.min(width, x + step)}`;
        y = clamp(y + Math.round((rand() - 0.5) * amp), base - amp, base + amp);
        if (x + step < width) d += `V${y}`;
      }
      return `${d}V${height}Z`;
    }

    function svg(viewBox, className, aspect) {
      const el = document.createElementNS(SVG_NS, 'svg');
      el.setAttribute('viewBox', viewBox);
      el.setAttribute('preserveAspectRatio', aspect);
      el.setAttribute('class', className);
      el.setAttribute('aria-hidden', 'true');
      return el;
    }

    function path(d, className) {
      const el = document.createElementNS(SVG_NS, 'path');
      el.setAttribute('d', d);
      if (className) el.setAttribute('class', className);
      return el;
    }

    return {
      horizon() {
        if (!horizon) {
          const rand = random(20251009);
          horizon = svg('0 0 320 64', 'scene__horizon', 'xMidYMax slice');
          horizon.appendChild(path(ridge(rand, 320, 64, 30, 9, 8), 'far'));
          horizon.appendChild(path(ridge(rand, 320, 64, 47, 6, 6), 'near'));
        }
        return horizon.cloneNode(true);
      },
      stars() {
        if (!stars) {
          const rand = random(7);
          let d = '';
          for (let i = 0; i < 46; i++) {
            const x = Math.floor(rand() * 320);
            const y = Math.floor(rand() * 120);
            d += `M${x} ${y}h1v1h-1z`;
          }
          stars = svg('0 0 320 180', 'scene__stars', 'xMidYMid slice');
          stars.appendChild(path(d));
        }
        return stars.cloneNode(true);
      },
    };
  })();

  const Scene = {
    root: null,
    key: null,
    token: 0,
    cache: new Map(),

    init() {
      this.root = $('scene');
    },

    show(cat) {
      const key = cat ? cat.id : '__default';
      if (key === this.key) return;
      this.key = key;
      const token = ++this.token;
      const look = cat || DEFAULT_SCENE;
      const src = cat ? cat.background : CONFIG.DEFAULT_BACKGROUND;
      // 그림을 미리 불러온 뒤 페이드를 시작해야 빈 화면이 깜빡이지 않는다
      this.preload(src).then((ok) => {
        if (token !== this.token) return; // 그 사이 다른 배경을 골랐으면 마지막 것만 반영
        this.addLayer(look, ok ? src : null);
      });
    },

    preload(src) {
      if (!src) return Promise.resolve(false);
      if (this.cache.has(src)) return Promise.resolve(this.cache.get(src));
      return new Promise((resolve) => {
        const img = new Image();
        let settled = false;
        let timer = 0;
        const finish = (ok, remember) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          if (remember) this.cache.set(src, ok);
          resolve(ok);
        };
        // 연결이 느리면 1.2초만 기다리고 진행 (그림은 도착하는 대로 나타남)
        timer = setTimeout(() => finish(true, false), 1200);
        img.onload = () => {
          const decoded = typeof img.decode === 'function' ? img.decode().catch(() => {}) : Promise.resolve();
          decoded.then(() => finish(true, true));
        };
        img.onerror = () => finish(false, true);
        img.src = src;
      });
    },

    addLayer(look, src) {
      const layer = document.createElement('div');
      layer.className = 'scene__layer';
      layer.style.setProperty('--sky-top', look.sky[0]);
      layer.style.setProperty('--sky-bottom', look.sky[1]);
      layer.style.setProperty('--glow', hexToRgba(look.accent, 0.3));
      if (src) {
        // 그림 아래에 하늘색을 깔아 두면 투명한 부분이나 로딩 중에도 자연스럽다
        const safe = src.replace(/["\\]/g, '');
        layer.style.backgroundImage = `url("${safe}"), linear-gradient(180deg, ${look.sky[0]}, ${look.sky[1]})`;
      } else {
        layer.classList.add('is-fallback');
        if (look.stars) layer.appendChild(PixelArt.stars());
        layer.appendChild(PixelArt.horizon());
      }
      this.root.appendChild(layer);
      void layer.offsetWidth; // 투명한 시작 상태를 확정한 뒤
      layer.classList.add('is-visible'); // opacity 0.8s ease-in-out 으로 덮기

      // 새 레이어가 다 덮이면 아래 레이어들을 정리
      const cleanup = () => {
        if (!layer.isConnected) return;
        let below = layer.previousElementSibling;
        while (below) {
          const next = below.previousElementSibling;
          below.remove();
          below = next;
        }
      };
      layer.addEventListener('transitionend', (event) => {
        if (event.target === layer) cleanup();
      });
      setTimeout(cleanup, 1600);
    },
  };

  /* ---------------------------------------------------------
   * 10. 화면 (도크 · 지금 재생 중 · 서랍 · 표시들)
   * ------------------------------------------------------- */
  const els = {};

  function viewStatus(player) {
    if (!player) return 'off';
    if (player.status === 'error') return 'error';
    if (state.paused || player.status === 'paused') return 'paused';
    if (player.status !== 'playing' || player.buffering) return 'loading';
    return 'playing';
  }

  const UI = {
    dockButtons: [],
    timerButtons: [],

    init() {
      [
        'dock', 'nowPlaying', 'nowPlayingText', 'gearButton', 'drawer', 'drawerClose',
        'drawerEmpty', 'drawerControls', 'nowIcon', 'nowName', 'nowTrack', 'nowStatus',
        'volumeRange', 'volumeValue', 'volumeNote', 'trackSelect', 'muteSwitch', 'muteBadge',
        'timerBadge', 'timerBadgeText', 'timerLeft', 'timerOptions', 'langOptions',
        'toast', 'srStatus', 'osd', 'osdUse', 'clock', 'donateLink', 'credits', 'creditList',
      ].forEach((id) => {
        els[id] = $(id);
      });
      this.buildDock();
      this.buildTimerOptions();
      this.bindControls();
    },

    buildDock() {
      const fragment = document.createDocumentFragment();
      SOUND_DATA.forEach((cat) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dock-btn';
        btn.dataset.id = cat.id;
        btn.style.setProperty('--accent', cat.accent);
        btn.style.setProperty('--accent-soft', hexToRgba(cat.accent, 0.26));
        btn.setAttribute('aria-pressed', 'false');

        const tile = document.createElement('span');
        tile.className = 'dock-btn__tile';
        const icon = document.createElement('span');
        icon.className = 'dock-btn__icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = cat.icon;
        tile.appendChild(icon);

        const led = document.createElement('span');
        led.className = 'dock-btn__led';
        led.setAttribute('aria-hidden', 'true');

        const tip = document.createElement('span');
        tip.className = 'dock-btn__tip';
        tip.setAttribute('aria-hidden', 'true');

        btn.append(tile, led, tip);
        btn.addEventListener('click', (event) => {
          Engine.activate(cat.id);
          // 마우스·터치로 눌렀으면 포커스를 풀어, 이어서 Space를 눌러도 테두리가 생기지 않게
          // (키보드로 누른 경우 event.detail === 0 → 포커스 유지)
          if (event.detail > 0) btn.blur();
        });
        fragment.appendChild(btn);
        this.dockButtons.push(btn);
      });
      els.dock.appendChild(fragment);
    },

    buildTimerOptions() {
      this.timerButtons = [0].concat(CONFIG.SLEEP_TIMER_MINUTES).map((minutes) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'segmented__btn';
        btn.dataset.minutes = String(minutes);
        btn.setAttribute('aria-pressed', String(minutes === 0));
        btn.addEventListener('click', () => SleepTimer.set(minutes));
        els.timerOptions.appendChild(btn);
        return btn;
      });
    },

    // 언어가 바뀔 때 스크립트가 만든 문구들을 다시 쓴다
    relabel() {
      this.dockButtons.forEach((btn, index) => {
        const cat = byId.get(btn.dataset.id);
        btn.setAttribute('aria-label', `${L(cat.name)} (${index + 1})`);
        btn.querySelector('.dock-btn__tip').textContent = L(cat.name);
      });
      this.timerButtons.forEach((btn) => {
        const minutes = Number(btn.dataset.minutes);
        btn.textContent = minutes ? t('timerOption', { n: minutes }) : t('timerOff');
      });
      els.trackSelect.dataset.cat = ''; // 트랙 목록을 새 언어로 다시 만들게
      els.gearButton.setAttribute('aria-label', t(state.drawerOpen ? 'closeSettings' : 'openSettings'));
      this.renderLanguageButtons();
      MediaSessionBridge.key = null; // 미디어 정보도 새 언어로
    },

    bindControls() {
      // event.detail === 0 이면 키보드로 누른 것 → 포커스를 서랍 안/밖으로 옮겨 준다
      els.gearButton.addEventListener('click', (event) => Drawer.toggle(event.detail === 0));
      els.drawerClose.addEventListener('click', (event) => Drawer.close(event.detail === 0));
      els.timerBadge.addEventListener('click', (event) => Drawer.open(event.detail === 0));

      els.volumeRange.addEventListener('input', () => {
        if (state.player) Engine.setVolume(state.player.category.id, Number(els.volumeRange.value));
      });
      els.volumeRange.addEventListener('change', () => Store.save());

      els.trackSelect.addEventListener('change', () => {
        if (state.player) Engine.selectTrack(state.player.category.id, els.trackSelect.value);
      });

      els.muteSwitch.addEventListener('click', () => Engine.toggleMute());
      els.muteBadge.addEventListener('click', () => Engine.setMuted(false, false));

      els.langOptions.querySelectorAll('[data-lang]').forEach((btn) => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
      });

      // 서랍 바깥(배경)을 누르면 닫기 — 도크와 시계 옆 표시는 서랍을 연 채로 쓸 수 있게 제외
      document.addEventListener('pointerdown', (event) => {
        if (!state.drawerOpen) return;
        const target = event.target;
        const inside = [els.drawer, els.gearButton, els.dock, els.muteBadge, els.timerBadge].some((el) =>
          el.contains(target)
        );
        if (!inside) Drawer.close(false);
      });

      if (!CAN_SET_VOLUME) {
        els.volumeRange.disabled = true;
        els.volumeNote.hidden = false;
      }
    },

    render() {
      const player = state.player;
      const cat = player ? player.category : null;
      const status = viewStatus(player);

      // 켜진 소리의 색으로 UI 물들이기
      const accent = cat ? cat.accent : DEFAULT_SCENE.accent;
      const rootStyle = document.documentElement.style;
      rootStyle.setProperty('--accent', accent);
      rootStyle.setProperty('--accent-soft', hexToRgba(accent, 0.26));

      // 도크
      this.dockButtons.forEach((btn) => {
        const active = !!cat && btn.dataset.id === cat.id;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
        btn.classList.toggle('is-loading', active && status === 'loading');
        btn.classList.toggle('is-paused', active && status === 'paused');
        btn.classList.toggle('is-error', active && status === 'error');
      });

      // 지금 재생 중
      const np = els.nowPlaying;
      if (cat) {
        els.nowPlayingText.textContent =
          status === 'error' ? `${cat.icon} ${t('fileNotFound')}` : `${cat.icon} ${L(player.track.title)}`;
        np.classList.add('is-visible');
      } else {
        np.classList.remove('is-visible');
      }
      np.classList.toggle('is-playing', status === 'playing');
      np.classList.toggle('is-paused', status === 'paused');
      np.classList.toggle('is-error', status === 'error');

      // 음소거 표시
      els.muteBadge.hidden = !Store.data.muted;
      els.muteSwitch.setAttribute('aria-checked', String(Store.data.muted));

      this.renderDrawer(player, status);
      MediaSessionBridge.sync(player, status);
    },

    renderDrawer(player, status) {
      const cat = player ? player.category : null;
      els.drawerEmpty.hidden = !!cat;
      els.drawerControls.hidden = !cat;
      if (!cat) return;

      els.nowIcon.textContent = cat.icon;
      els.nowName.textContent = L(cat.name);
      els.nowTrack.textContent = status === 'error' ? t('fileNotFound') : L(player.track.title);
      els.nowStatus.textContent = t(`status_${status}`);
      els.nowStatus.dataset.state = status;

      // 트랙 목록은 카테고리나 언어가 바뀔 때만 다시 만든다
      const select = els.trackSelect;
      if (select.dataset.cat !== cat.id) {
        select.dataset.cat = cat.id;
        const options = [new Option(t('random'), 'random')].concat(
          cat.tracks.map((tr) => new Option(L(tr.title), tr.id))
        );
        select.replaceChildren(...options);
      }
      select.value = Store.trackChoice(cat.id);
      this.renderVolume();
    },

    renderVolume() {
      const cat = state.player && state.player.category;
      if (!cat) return;
      const volume = Store.volume(cat.id);
      els.volumeRange.value = String(volume);
      els.volumeRange.style.setProperty('--fill', `${volume}%`);
      els.volumeRange.setAttribute('aria-valuetext', `${volume}%`);
      els.volumeValue.textContent = `${volume}%`;
    },

    renderTimer() {
      const active = SleepTimer.endAt > 0;
      const ms = SleepTimer.remaining();
      this.timerButtons.forEach((btn) => {
        const minutes = Number(btn.dataset.minutes);
        btn.setAttribute('aria-pressed', String(active ? minutes === SleepTimer.minutes : minutes === 0));
      });
      els.timerLeft.textContent = active ? t('timerLeft', { time: formatDuration(ms) }) : '';
      els.timerBadge.hidden = !active;
      if (active) {
        const minutesLeft = Math.max(1, Math.ceil(ms / 60000));
        els.timerBadgeText.textContent = t('timerBadge', { n: minutesLeft });
        els.timerBadge.setAttribute('aria-label', t('timerBadgeLabel', { n: minutesLeft }));
      }
    },

    renderLanguageButtons() {
      els.langOptions.querySelectorAll('[data-lang]').forEach((btn) => {
        btn.setAttribute('aria-pressed', String(btn.dataset.lang === LANG));
      });
    },

    // 같은 오류가 반복돼도 흔들림이 다시 보이게
    flashError(catId) {
      const btn = this.dockButtons.find((b) => b.dataset.id === catId);
      if (!btn) return;
      btn.classList.remove('is-error');
      void btn.offsetWidth;
      btn.classList.add('is-error');
    },

    // 화면 낭독기용 안내
    announce(message) {
      els.srStatus.textContent = '';
      window.setTimeout(() => {
        els.srStatus.textContent = message;
      }, 30);
    },
  };

  /* ---------------------------------------------------------
   * 11. 설정 서랍
   * ------------------------------------------------------- */
  const Drawer = {
    open(byKeyboard) {
      if (state.drawerOpen) return;
      state.drawerOpen = true;
      els.drawer.removeAttribute('inert');
      els.drawer.setAttribute('aria-hidden', 'false');
      els.drawer.classList.add('is-open');
      els.gearButton.classList.add('is-open');
      els.gearButton.setAttribute('aria-expanded', 'true');
      els.gearButton.setAttribute('aria-label', t('closeSettings'));
      UI.render();
      UI.renderTimer();
      if (byKeyboard) {
        // 키보드 사용자는 서랍 안으로 포커스 이동
        window.setTimeout(() => {
          if (state.drawerOpen) els.drawerClose.focus({ preventScroll: true });
        }, 60);
      } else if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
    },

    close(byKeyboard) {
      if (!state.drawerOpen) return;
      const focusWasInside = els.drawer.contains(document.activeElement);
      state.drawerOpen = false;
      els.drawer.classList.remove('is-open');
      els.drawer.setAttribute('aria-hidden', 'true');
      els.drawer.setAttribute('inert', '');
      els.gearButton.classList.remove('is-open');
      els.gearButton.setAttribute('aria-expanded', 'false');
      els.gearButton.setAttribute('aria-label', t('openSettings'));
      // 키보드로 닫았으면 톱니바퀴로 포커스를 돌려주고, 마우스로 닫았으면 포커스를 푼다
      if (byKeyboard) els.gearButton.focus({ preventScroll: true });
      else if (focusWasInside || document.activeElement === els.gearButton) document.activeElement.blur();
    },

    toggle(byKeyboard) {
      if (state.drawerOpen) this.close(byKeyboard);
      else this.open(byKeyboard);
    },
  };

  /* ---------------------------------------------------------
   * 12. 슬립 타이머 — 정한 시간이 지나면 아주 천천히 줄이고 일시정지
   *     (Space를 누르면 다시 재생)
   * ------------------------------------------------------- */
  const SleepTimer = {
    endAt: 0,
    minutes: 0,
    interval: 0,

    set(minutes) {
      const wasActive = this.endAt > 0;
      this.stop();
      if (minutes > 0) {
        this.minutes = minutes;
        this.endAt = Date.now() + minutes * 60000;
        this.interval = setInterval(() => this.check(), 1000);
        Toast.show(t('timerSet', { n: minutes }));
        UI.announce(t('timerSet', { n: minutes }));
      } else if (wasActive) {
        Toast.show(t('timerCanceled'));
        UI.announce(t('timerCanceled'));
      }
      UI.renderTimer();
    },

    stop() {
      clearInterval(this.interval);
      this.interval = 0;
      this.endAt = 0;
      this.minutes = 0;
    },

    remaining() {
      return this.endAt ? Math.max(0, this.endAt - Date.now()) : 0;
    },

    // 1초마다 확인 (백그라운드 탭에서 타이머가 늦게 와도 시각으로 판단하므로 어긋나지 않음)
    check() {
      if (!this.endAt) return;
      if (Date.now() >= this.endAt) this.finish();
      else UI.renderTimer();
    },

    finish() {
      this.stop();
      const player = state.player;
      if (player && !state.paused && player.status !== 'error') {
        state.paused = true;
        player.pause(CONFIG.FADE_MS.sleep);
        UI.render();
      }
      Toast.show(t('timerEnded'), 'info', 8000);
      UI.announce(t('timerEnded'));
      UI.renderTimer();
    },
  };

  /* ---------------------------------------------------------
   * 13. 디지털 시계 — 매분 정각에 맞춰, 바뀐 숫자만 부드럽게
   *     12/24시간제는 방문자 지역 설정을 따른다 (CONFIG.CLOCK_FORMAT으로 고정 가능)
   * ------------------------------------------------------- */
  const Clock = {
    slots: [],
    signature: '',
    last: '',
    timer: 0,
    hourCycle: 'h23',

    init() {
      this.hourCycle = this.resolveHourCycle();
      this.render(true);
      this.scheduleNext();
      // 탭이 뒤에 있으면 타이머가 늦어질 수 있어, 돌아오면 바로 맞춘다
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.render(false);
          this.scheduleNext();
        }
      });
    },

    resolveHourCycle() {
      if (String(CONFIG.CLOCK_FORMAT) === '12') return 'h12';
      if (String(CONFIG.CLOCK_FORMAT) === '24') return 'h23';
      try {
        const options = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions();
        if (options.hourCycle) return options.hourCycle === 'h11' || options.hourCycle === 'h12' ? 'h12' : 'h23';
        if (typeof options.hour12 === 'boolean') return options.hour12 ? 'h12' : 'h23';
      } catch (err) {
        /* Intl을 못 쓰면 24시간제 */
      }
      return 'h23';
    },

    // AM/PM · 오전/오후 표기는 화면 언어를 따른다
    formatter() {
      const browser = String(navigator.language || '');
      const locale = LANG === 'ko' ? 'ko-KR' : /^en\b/i.test(browser) ? browser : 'en-US';
      try {
        return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', hourCycle: this.hourCycle });
      } catch (err) {
        return null;
      }
    },

    // 시계를 칸으로 나눈다: 숫자 · 콜론 · 오전/오후
    slotsFor(date, formatter) {
      if (formatter && typeof formatter.formatToParts === 'function') {
        const out = [];
        formatter.formatToParts(date).forEach((part) => {
          if (part.type === 'hour' || part.type === 'minute') {
            part.value.split('').forEach((ch) => out.push({ kind: 'digit', value: ch }));
          } else if (part.type === 'dayPeriod') {
            out.push({ kind: 'period', value: part.value });
          } else if (part.type === 'literal' && part.value.trim() === ':') {
            out.push({ kind: 'colon', value: ':' });
          }
        });
        if (out.some((slot) => slot.kind === 'colon')) return out;
      }
      const hh = pad2(date.getHours());
      const mm = pad2(date.getMinutes());
      return [hh[0], hh[1], ':', mm[0], mm[1]].map((ch) =>
        ch === ':' ? { kind: 'colon', value: ch } : { kind: 'digit', value: ch }
      );
    },

    // setInterval(60초)은 접속 시각에 따라 최대 59초 늦게 바뀌므로 '다음 정각 분'에 맞춘다
    scheduleNext() {
      clearTimeout(this.timer);
      const now = new Date();
      const wait = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 40;
      this.timer = setTimeout(() => {
        this.render(false);
        this.scheduleNext();
      }, wait);
    },

    render(instant) {
      const now = new Date();
      const formatter = this.formatter();
      const slots = this.slotsFor(now, formatter);
      const text = slots.map((slot) => slot.value).join('|');
      if (text === this.last && !instant) return;
      this.last = text;

      els.clock.dateTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
      const spoken = formatter ? formatter.format(now) : els.clock.dateTime;
      els.clock.setAttribute('aria-label', t('clockLabel', { time: spoken }));

      const signature = slots.map((slot) => slot.kind).join(',');
      if (instant || signature !== this.signature) {
        // 자리 수가 바뀌면 (9:59 → 10:00 등) 통째로 다시 그린다
        this.build(slots, !instant);
        return;
      }
      slots.forEach((slot, i) => {
        if (this.slots[i].value !== slot.value) this.swap(this.slots[i], slot.value);
      });
    },

    build(slots, animate) {
      els.clock.textContent = '';
      this.slots = slots.map((slot) => {
        const span = document.createElement('span');
        span.setAttribute('aria-hidden', 'true');
        span.className =
          slot.kind === 'digit' ? 'clock__digit' : slot.kind === 'colon' ? 'clock__colon' : 'clock__period';
        span.textContent = slot.value;
        els.clock.appendChild(span);
        return { el: span, kind: slot.kind, value: slot.value };
      });
      this.signature = slots.map((slot) => slot.kind).join(',');
      if (animate && !REDUCED_MOTION && typeof els.clock.animate === 'function') {
        els.clock.animate(
          [
            { opacity: 0, filter: 'blur(4px)' },
            { opacity: 1, filter: 'blur(0px)' },
          ],
          { duration: 520, easing: 'ease-out' }
        );
      }
    },

    // 바뀐 칸만 흐려지며 위로 사라지고, 새 값이 아래에서 떠오른다
    swap(slot, value) {
      slot.value = value;
      const span = slot.el;
      if (REDUCED_MOTION || typeof span.animate !== 'function') {
        span.textContent = value;
        return;
      }
      const out = span.animate(
        [
          { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
          { opacity: 0, transform: 'translateY(-0.18em)', filter: 'blur(4px)' },
        ],
        { duration: 320, easing: 'ease-in', fill: 'forwards' }
      );
      out.onfinish = () => {
        span.textContent = slot.value;
        span.animate(
          [
            { opacity: 0, transform: 'translateY(0.18em)', filter: 'blur(4px)' },
            { opacity: 1, transform: 'translateY(0)', filter: 'blur(0px)' },
          ],
          { duration: 480, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
        out.cancel();
      };
    },

    // 언어가 바뀌면 오전/오후 표기가 달라지므로 다시 그린다
    refresh() {
      this.last = '';
      this.signature = '';
      this.render(true);
    },
  };

  /* ---------------------------------------------------------
   * 14. 단축키 — 이 탭이 활성화되어 있을 때만 (유튜브 방식)
   * ------------------------------------------------------- */
  const NON_TEXT_INPUTS = new Set(['range', 'checkbox', 'radio', 'button', 'submit', 'reset', 'color', 'file', 'image']);

  function isTypingTarget(el) {
    if (!el || el === document.body) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === 'TEXTAREA') return true;
    if (el.tagName === 'INPUT') return !NON_TEXT_INPUTS.has(String(el.type || 'text').toLowerCase());
    return false;
  }

  const Hotkeys = {
    init() {
      document.addEventListener('keydown', (event) => this.onKeyDown(event));
      document.addEventListener('keyup', (event) => this.onKeyUp(event));
    },

    onKeyDown(event) {
      // 지금 이 웹 페이지(탭)가 활성화되어 있을 때만 동작
      if (!document.hasFocus()) return;
      if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey) return;
      if (isTypingTarget(event.target)) return;

      // code(물리적 키 위치) 기준 — 한글 입력 상태에서도 M이 'ㅡ'로 바뀌지 않는다
      const code = event.code;
      const key = String(event.key || '').toLowerCase();

      if (code === 'Space' || key === ' ') {
        // 스크롤 방지 + 포커스가 있는 버튼이 Space로 한 번 더 눌리는 것 방지
        event.preventDefault();
        if (!event.repeat) Engine.togglePause();
        return;
      }

      if (code === 'KeyM' || key === 'm') {
        event.preventDefault();
        if (!event.repeat) Engine.toggleMute();
        return;
      }

      if (code === 'Escape' || key === 'escape') {
        if (state.drawerOpen) {
          event.preventDefault();
          Drawer.close(true);
        }
        return;
      }

      const digit = /^(?:Digit|Numpad)([1-8])$/.exec(code || '');
      const number = digit ? Number(digit[1]) : /^[1-8]$/.test(key) ? Number(key) : 0;
      const cat = number ? SOUND_DATA[number - 1] : null;
      if (cat) {
        event.preventDefault();
        if (!event.repeat) Engine.activate(cat.id);
      }
    },

    // 브라우저에 따라 Space를 '뗄 때' 버튼이 눌리므로 여기서도 막는다
    onKeyUp(event) {
      if (event.ctrlKey || event.altKey || event.metaKey || isTypingTarget(event.target)) return;
      if (event.code === 'Space' || event.key === ' ') event.preventDefault();
    },
  };

  /* ---------------------------------------------------------
   * 15. 알림 · 화면 가운데 표시 · 미디어 키
   * ------------------------------------------------------- */
  const Toast = {
    timer: 0,
    show(message, tone, ms) {
      els.toast.textContent = message;
      els.toast.dataset.tone = tone || 'info';
      els.toast.classList.add('is-visible');
      clearTimeout(this.timer);
      this.timer = setTimeout(() => els.toast.classList.remove('is-visible'), ms || 3200);
    },
  };

  const OSD = {
    animation: null,
    show(kind) {
      els.osdUse.setAttribute('href', `#i-${kind}`);
      if (typeof els.osd.animate !== 'function') return;
      if (this.animation) this.animation.cancel();
      const center = 'translate(-50%, -50%)';
      const frames = REDUCED_MOTION
        ? [{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }]
        : [
            { opacity: 0, transform: `${center} scale(0.86)` },
            { opacity: 1, transform: `${center} scale(1)`, offset: 0.22 },
            { opacity: 1, transform: `${center} scale(1)`, offset: 0.62 },
            { opacity: 0, transform: `${center} scale(1.06)` },
          ];
      this.animation = els.osd.animate(frames, { duration: 820, easing: 'ease-out' });
    },
  };

  // 키보드의 재생/일시정지 키, OS 미디어 조절과 연결
  // (연결하지 않으면 브라우저가 소리를 직접 멈춰 화면 상태와 어긋난다)
  const MediaSessionBridge = {
    supported: 'mediaSession' in navigator,
    key: null,

    init() {
      if (!this.supported) return;
      const handle = (action, handler) => {
        try {
          navigator.mediaSession.setActionHandler(action, handler);
        } catch (err) {
          /* 지원하지 않는 동작 */
        }
      };
      handle('play', () => {
        if (state.player && state.paused) Engine.togglePause();
      });
      handle('pause', () => {
        if (state.player && !state.paused) Engine.togglePause();
      });
      handle('stop', () => {
        if (state.player) Engine.turnOff();
      });
    },

    sync(player, status) {
      if (!this.supported) return;
      try {
        if (!player || status === 'error') {
          this.key = null;
          navigator.mediaSession.metadata = null;
          navigator.mediaSession.playbackState = 'none';
          return;
        }
        const key = `${LANG}/${player.category.id}/${player.track.id}`;
        if (key !== this.key && typeof window.MediaMetadata === 'function') {
          this.key = key;
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: L(player.track.title),
            artist: L(player.category.name),
            album: t('siteTitle'),
          });
        }
        navigator.mediaSession.playbackState = status === 'paused' ? 'paused' : 'playing';
      } catch (err) {
        /* 무시 */
      }
    },
  };

  /* ---------------------------------------------------------
   * 16. 후원 · 에셋 출처
   * ------------------------------------------------------- */
  function setupDonate() {
    const url = String(CONFIG.DONATE_URL || '').trim();
    if (/^https?:\/\//i.test(url)) {
      els.donateLink.href = url;
      return;
    }
    els.donateLink.addEventListener('click', (event) => {
      event.preventDefault();
      Toast.show(t(IS_LOCAL ? 'donateMissingLocal' : 'donateMissing'));
    });
  }

  function setupCredits() {
    if (!CREDITS.length) return;
    CREDITS.forEach((credit) => {
      const item = document.createElement('li');
      const label = [credit.title, credit.author, credit.license].filter(Boolean).join(', ');
      if (credit.url) {
        const link = document.createElement('a');
        link.href = credit.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = label;
        item.appendChild(link);
      } else {
        item.textContent = label;
      }
      els.creditList.appendChild(item);
    });
    els.credits.hidden = false;
  }

  /* ---------------------------------------------------------
   * 17. 시작
   * ------------------------------------------------------- */
  function init() {
    Store.load(); // 저장된 볼륨 · 트랙 · 음소거 · 언어 복원
    LANG = detectLanguage();
    UI.init();
    Scene.init();
    Scene.show(null);
    Clock.init();
    Hotkeys.init();
    MediaSessionBridge.init();
    setupDonate();
    setupCredits();
    applyLanguage(); // 문구 채우기 + 첫 화면 그리기
    window.addEventListener('pagehide', () => Store.save());
    // 백그라운드에서 돌아오면 슬립 타이머를 바로 확인
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) SleepTimer.check();
    });
    // 첫 화면 등장은 한 번만
    requestAnimationFrame(() => {
      requestAnimationFrame(() => document.body.classList.remove('is-booting'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
