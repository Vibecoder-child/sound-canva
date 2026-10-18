# Sound Canvas (사운드 캔버스)

빗소리, 모닥불, 카페 소음, 로파이 음악을 픽셀 아트 풍경과 함께 틀어 두는 정적 웹사이트입니다.
서버 없이 HTML · CSS · 자바스크립트만으로 동작하고, GitHub Pages에 무료로 올릴 수 있습니다.

- 화면은 **영어가 기본**이고, 방문자의 브라우저가 한국어면 **한국어**로 자동으로 바뀝니다. (설정 서랍에서 직접 바꿀 수도 있음)
- 시계는 방문자 지역 설정을 따라 12시간제(미국·한국 등) 또는 24시간제(영국·일본·독일 등)로 표시됩니다.

## 바로 열어 보기

- `index.html`을 더블클릭하면 브라우저에서 바로 열리고, 모든 기능이 동작합니다.
- 지금은 **White Noise(백색소음)** 3종만 실제 소리가 들어 있습니다. 나머지는 아래 표의 파일을 넣으면 바로 재생됩니다.
- 배경 그림을 넣기 전에는 픽셀 지평선이 있는 대체 화면이 나옵니다.

## 폴더 구조

```
website dev/
├── index.html          화면 구조
├── README.md           이 문서
├── css/
│   └── style.css       디자인과 애니메이션
├── js/
│   └── script.js       설정 · 화면 문구(영어/한국어) · 데이터(JSON 배열) · 오디오 · 배경 · 서랍 · 시계 · 단축키 · 슬립 타이머 · 저장
└── assets/
    ├── audio/          소리 파일 (mp3)
    └── images/         배경 그림 (webp)
```

## 에셋 넣는 방법

1. 무료 에셋을 받습니다. (아래 '에셋 구할 때' 참고)
2. 아래 표의 **이름 그대로** `assets/audio` 또는 `assets/images` 폴더에 저장합니다. (같은 이름이면 덮어쓰기)
3. 브라우저를 새로고침합니다.

> 파일 이름은 **모두 소문자**로 저장하세요. Windows는 대소문자를 구분하지 않아 내 컴퓨터에서는 되는데,
> GitHub Pages에 올리면 `Rain_1.mp3`와 `rain_1.mp3`를 다른 파일로 봐서 소리가 안 나올 수 있습니다.

### 소리 — 29개 (assets/audio)

| 카테고리 | 파일 (assets/audio/) | 영어 제목 | 한국어 제목 | 상태 |
| --- | --- | --- | --- | --- |
| 🌧️ Rain (빗소리) | rain_1.mp3 | Rain on the window | 창가에 내리는 비 | 들어 있음 |
| 🌧️ Rain (빗소리) | rain_2.mp3 | Rain on a tent | 텐트 위 빗소리 | 들어 있음 |
| 🌧️ Rain (빗소리) | rain_3.mp3 | Rain on the windowsill | 창틀에 떨어지는 비 | 들어 있음 |
| 🌧️ Rain (빗소리) | rain_4.mp3 | Light rain | 잔잔한 비 | 들어 있음 |
| 🔥 Fire (불) | fire_1.mp3 | Crackling campfire | 타닥타닥 모닥불 | 들어 있음 |
| 🔥 Fire (불) | fire_2.mp3 | Fireplace | 벽난로 | 들어 있음 |
| 🔥 Fire (불) | fire_3.mp3 | Campfire and crickets | 캠프파이어와 풀벌레 | 들어 있음 |
| 🌿 Nature (자연) | nature_1.mp3 | Birds at dawn | 새벽 숲 새소리 | 들어 있음 |
| 🌿 Nature (자연) | nature_2.mp3 | Summer night insects | 여름밤 풀벌레 | 들어 있음 |
| 🌿 Nature (자연) | nature_3.mp3 | Wind over the meadow | 바람 부는 들판 | 들어 있음 |
| 🌿 Nature (자연) | nature_4.mp3 | Frogs in the rice field | 개구리 우는 논 | 들어 있음 |
| ☕ Cafe (카페) | cafe_1.mp3 | Quiet afternoon cafe | 조용한 오후 카페 | 들어 있음 |
| ☕ Cafe (카페) | cafe_2.mp3 | Busy cafe | 북적이는 카페 | 들어 있음 |
| ☕ Cafe (카페) | cafe_3.mp3 | Typing in the cafe | 키보드 소리 나는 카페 | 들어 있음 |
| 🌊 Water (물) | water_1.mp3 | Babbling brook | 졸졸 시냇물 | 들어 있음 |
| 🌊 Water (물) | water_2.mp3 | Gentle waves | 잔잔한 파도 | 들어 있음 |
| 🌊 Water (물) | water_3.mp3 | Distant waterfall | 멀리서 들리는 폭포 | 들어 있음 |
| 🌊 Water (물) | water_4.mp3 | Water droplets | 똑똑 떨어지는 물방울 | 들어 있음 |
| 📻 White Noise (백색소음) | whitenoise_1.mp3 | White noise | 화이트 노이즈 | 들어 있음 |
| 📻 White Noise (백색소음) | whitenoise_2.mp3 | Pink noise | 핑크 노이즈 | 들어 있음 |
| 📻 White Noise (백색소음) | whitenoise_3.mp3 | Brown noise | 브라운 노이즈 | 들어 있음 |
| ⌨️ Workspace (작업) | workspace_1.mp3 | Keyboard typing | 키보드 타이핑 | 들어 있음 |
| ⌨️ Workspace (작업) | workspace_2.mp3 | Quiet office | 조용한 사무실 | 들어 있음 |
| ⌨️ Workspace (작업) | workspace_3.mp3 | Library | 도서관 | 들어 있음 |
| ⌨️ Workspace (작업) | workspace_4.mp3 | Pencil on paper | 연필로 필기하는 소리 | 들어 있음 |
| ⌨️ Workspace (작업) | workspace_5.mp3 | Deep mechanical keyboard | 묵직한 기계식 키보드 | 들어 있음 |
| 🎧 Lofi (음악) | lofi_1.mp3 | Ease into Night | Ease into Night (밤으로 스며들기) | 들어 있음 |
| 🎧 Lofi (음악) | lofi_2.mp3 | Calm Currents | Calm Currents (잔잔한 물결) | 들어 있음 |
| 🎧 Lofi (음악) | lofi_3.mp3 | Moon Unit | Moon Unit (달의 조각) | 들어 있음 |

#### 들어 있는 소리의 원본 (Freesound)

| 파일 | 원본 | 라이선스 | 사용 구간 · 반복 길이 |
| --- | --- | --- | --- |
| rain_1.mp3 | [Rain recorded inside with open window — BonnyOrbit](https://freesound.org/people/BonnyOrbit/sounds/392304/) | CC0 | 0:10–3:10 · 3분 |
| rain_2.mp3 | [rain1.wav — Rocktopus](https://freesound.org/people/Rocktopus/sounds/233434/) | **CC BY 3.0 (출처 표기 필요)** | 2:44–5:08 · 2분 24초 |
| rain_3.mp3 | [more rain.wav — mlaramie](https://freesound.org/people/mlaramie/sounds/193875/) | CC0 | 0:15–2:13 · 1분 58초 |
| rain_4.mp3 | [Light Rain — soundrecorder7](https://freesound.org/people/soundrecorder7/sounds/167034/) | CC0 | 0:00–0:23 · 23초 |
| fire_1.mp3 | [Nighttime Bonfire 1 — samararaine](https://freesound.org/people/samararaine/sounds/186316/) | CC0 | 0:00–1:26 · 1분 26초 |
| fire_2.mp3 | [Fireplace for Six Minutes (Stereo) — petebuchwald](https://freesound.org/people/petebuchwald/sounds/496130/) | CC0 | 3:00–6:00 · 3분 |
| fire_3.mp3 | [campfire in a forest at night — Duophonic](https://freesound.org/people/Duophonic/sounds/248303/) | CC0 | 0:05–2:05 · 2분 |
| nature_1.mp3 | [Birds singing, Dawn chorus — SamsterBirdies](https://freesound.org/people/SamsterBirdies/sounds/578523/) | CC0 | 0:15–3:15 · 3분 |
| nature_2.mp3 | [Night Ambience 01 - Aug 2 2013 - Back Yard — rgbrobot](https://freesound.org/people/rgbrobot/sounds/195969/) | CC0 | 0:10–3:10 · 3분 |
| nature_3.mp3 | [Dry grass rustling in the wind — felix.blume](https://freesound.org/people/felix.blume/sounds/146436/) | CC0 | 0:45–2:45 · 2분 |
| nature_4.mp3 | [Night frogs chorus with close crickets — MeliaRoger](https://freesound.org/people/MeliaRoger/sounds/645706/) | CC0 | 4:35–7:35 · 3분 |
| cafe_1.mp3 | [0105coffeehouse.wav — moxobna](https://freesound.org/people/moxobna/sounds/46310/) | CC0 | 3:20–6:15 · 2분 55초 |
| cafe_2.mp3 | [coffee shop ambience — waweee](https://freesound.org/people/waweee/sounds/370973/) | CC0 | 0:35–3:35 · 3분 |
| cafe_3.mp3 | [Ambient sound inside cafe dining — 4team](https://freesound.org/people/4team/sounds/214993/) + [Mechanical Keyboard Typing — stu556](https://freesound.org/people/stu556/sounds/450282/) | CC0 + CC0 | 카페 0:12–2:08 · 1분 56초에 타이핑을 띄엄띄엄 섞음 |
| water_1.mp3 | [small stream forest — Yuval](https://freesound.org/people/Yuval/sounds/197023/) | CC0 | 0:02–2:18 · 2분 16초 |
| water_2.mp3 | [Calm ocean waves — SamsterBirdies](https://freesound.org/people/SamsterBirdies/sounds/578524/) | CC0 | 0:00–2:55 · 2분 55초 |
| water_3.mp3 | [Hidden waterfall — BassmanJourney](https://freesound.org/people/BassmanJourney/sounds/632107/) | CC0 | 0:05–1:35 · 1분 30초 (멀리서 들리게 가공) |
| water_4.mp3 | [cave 01 — rucisko](https://freesound.org/people/rucisko/sounds/343742/) | CC0 | 0:01–1:14를 12초 조각 6개로 나눠 순서를 섞음 · 2분 10초 |
| lofi_1.mp3 | [Ease into Night — HoliznaCC0](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/ease-into-night-lofi-relax-chill/) (Free Music Archive) | CC0 | 곡 전체 · 2분 32초 |
| lofi_2.mp3 | [Calm Currents — HoliznaCC0](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/calm-currents-lofi-relax-calm/) (Free Music Archive) | CC0 | 곡 전체 · 2분 28초 |
| lofi_3.mp3 | [Moon Unit — HoliznaCC0](https://freemusicarchive.org/music/holiznacc0/public-domain-lofi/moon-unit-lofi-reflection-dreamy/) (Free Music Archive) | CC0 | 곡 전체 · 2분 52초 |
| workspace_1.mp3 | [Mechanical Keyboard Typing (Treble Version) — stu556](https://freesound.org/people/stu556/sounds/450282/) | CC0 | 0:05–2:55 · 2분 50초 |
| workspace_2.mp3 | [Office ambience — Chelly01](https://freesound.org/people/Chelly01/sounds/541117/) | CC0 | 0:05–2:15 · 2분 10초 |
| workspace_3.mp3 | [Quiet library ambience — xkeril](https://freesound.org/people/xkeril/sounds/620683/) | CC0 | 5:40–8:40 · 3분 |
| workspace_4.mp3 | [Writing_Pencil_01 — moai15](https://freesound.org/people/moai15/sounds/336381/) + [Quiet library ambience — xkeril](https://freesound.org/people/xkeril/sounds/620683/) | CC0 + CC0 | 도서관 1:10–3:10 바탕에 필기 소리를 띄엄띄엄 섞음 · 2분 |
| workspace_5.mp3 | [Mechanical Keyboard Typing (Bass Version) — stu556](https://freesound.org/people/stu556/sounds/450281/) | CC0 | 0:02–2:52 · 2분 50초 |

- 처리: 구간 자르기 → 끝 4초(rain_4는 3초)를 처음에 겹쳐 반복 이음새 제거 → 음량 −25 LUFS로 맞춤(백색소음과 같은 기준), 피크 −1.5 dB 제한 → 128kbps mp3
- 불소리(fire_1~3)는 장작이 튀는 소리가 갑자기 크게 들리지 않도록, 아주 큰 순간만 살짝 눌렀습니다(압축).
- cafe_3은 음악 저작권 문제로 '재즈 카페' 대신, 카페 소리에 옆자리 키보드 소리를 띄엄띄엄 섞어 만들었습니다(타이핑이 웅성거림보다 약 7dB 작게, 오른쪽으로 살짝 치우침). 4team 원본의 찢어진(클리핑) 소리는 복원 필터로 다듬었습니다.
- 로파이(lofi_1~3)는 음악이라 자르지 않고 곡 전체를 쓰며, 음량만 다른 소리와 같은 −25 LUFS로 낮추고 160kbps로 저장했습니다. 곡이 끝나면 3초 겹치며 다음 곡으로 넘어갑니다.
- workspace_4는 필기 소리 원본이 38초뿐이라, 조용한 도서관 소리를 바탕에 깔고 필기 소리를 2.5~7초씩 띄엄띄엄 넣었습니다(필기할 때 바탕보다 약 6dB 크게).
- water_3은 가까이서 녹음한 폭포라 고음을 깎고 약간의 울림을 더해 멀리서 들리는 느낌으로 만들었습니다.
- water_4는 원본이 1분 남짓이라, 조각 순서를 섞어 같은 패턴이 바로 반복되지 않게 늘렸습니다.
- rain_3, rain_4, cafe_1~3은 원본이 모노라서, 오른쪽 채널을 반복 길이의 절반만큼 밀어 자연스러운 스테레오로 만들었습니다.
- rain_2는 CC BY 3.0이라 `js/script.js`의 `CREDITS`에 출처를 넣어 두었습니다. 설정 서랍 맨 아래 'Credits'(한국어 화면에서는 '에셋 출처')에 표시됩니다. 다른 CC0 소리로 바꾸면 그 줄을 지우면 됩니다.

### 배경 — 9개 (assets/images)

| 화면 | 파일 (assets/images/) | 장면 | 상태 |
| --- | --- | --- | --- |
| 아무 소리도 안 켰을 때 | default_bg.webp | 달 뜬 밤 언덕 위 오두막, 굴뚝 연기 | 들어 있음 |
| 🌧️ Rain (빗소리) | rain_bg.webp | 비 오는 밤 도시가 보이는 창가 | 들어 있음 |
| 🔥 Fire (불) | fire_bg.webp | 별이 뜬 숲속 모닥불 | 들어 있음 |
| 🌿 Nature (자연) | nature_bg.webp | 새벽빛 숲과 풀밭, 반딧불이 | 들어 있음 |
| ☕ Cafe (카페) | cafe_bg.webp | 전구 조명이 걸린 카페 창가 테이블 | 들어 있음 |
| 🌊 Water (물) | water_bg.webp | 달빛이 비치는 밤바다와 파도 | 들어 있음 |
| 📻 White Noise (백색소음) | whitenoise_bg.webp | 어두운 방의 지직거리는 레트로 TV | 들어 있음 |
| ⌨️ Workspace (작업) | workspace_bg.webp | 밤의 책상, 모니터와 스탠드 조명 | 들어 있음 |
| 🎧 Lofi (음악) | lofi_bg.webp | 노을 진 창가의 고양이와 턴테이블 | 들어 있음 |

- 배경 9개는 모두 코드로 직접 그린 픽셀 아트(320×180, 3초 반복 애니메이션 WebP)라 출처 표기나 라이선스 걱정이 없습니다.
- 그림을 고치고 싶으면 `tools/backgrounds/`의 파이썬 스크립트를 수정한 뒤 `python3 tools/backgrounds/scenes2.py assets/images` 로 다시 만들면 됩니다(Pillow 필요). 이 폴더는 사이트 동작과 무관합니다.

### 권장 사양

- **소리**: mp3, 1~5분 길이, 128kbps 정도면 충분합니다. 반복 지점은 자동으로 2.5초 크로스페이드되므로
  '이음새 없는 루프' 파일이 아니어도 끊기지 않습니다.
- **배경**: 움직이는 webp 또는 gif. 320×180처럼 작은 픽셀 아트여도 흐려지지 않고 선명하게 확대됩니다.
- gif를 쓰려면 `js/script.js`의 `SOUND_DATA`에서 그 카테고리의 `background` 확장자를 `.gif`로 바꾸세요.

## 에셋 구할 때 (라이선스 요약)

이 사이트는 소리 파일을 **그대로** 재생하고, 방문자도 파일 주소로 내려받을 수 있습니다. 그래서 라이선스가 중요합니다.

| 출처 | 종류 | 라이선스 | 메모 |
| --- | --- | --- | --- |
| [Freesound](https://freesound.org) | 빗소리 · 불 · 자연 · 카페 등 효과음 | 소리마다 CC0 / CC BY / CC BY-NC | 검색 필터로 CC0·CC BY만 고를 수 있음. **CC BY-NC는 피하기** |
| [OpenGameArt](https://opengameart.org) | 픽셀 아트(움직이는 스프라이트 · 배경) | CC0 / CC BY / CC BY-SA / OGA-BY / GPL | 상업적 이용 가능, CC0 외에는 출처 표기 |
| [Free Music Archive](https://freemusicarchive.org) | 음악(로파이 포함) | 곡마다 다름 (주로 CC) | 곡 페이지에서 라이선스 확인. CC BY는 상업 이용 가능, CC BY-NC는 불가 |
| [incompetech (Kevin MacLeod)](https://incompetech.com) | 음악 | CC BY | 출처 표기 필수 |
| [Pixabay](https://pixabay.com) | 효과음 · 음악 · GIF · 영상 | Pixabay 라이선스 | 출처 표기 불필요. 단, '아무 손질 없이 그대로 배포' 금지 조항이 있어 이 사이트처럼 파일을 그대로 트는 용도가 괜찮은지는 **확실하지 않음** |
| itch.io | 픽셀 아트 에셋 팩 | 제작자마다 다름 | 페이지마다 라이선스 확인 (재배포 금지 조건이 흔함) |

- **쓰면 안 되는 곳**: BBC Sound Effects (개인·교육·연구용만 허용, 상업적 이용 불가), 출처·라이선스가 적혀 있지 않은 GIF.
- **CC BY · OGA-BY** 에셋은 `js/script.js`의 `CREDITS`에 제목 · 만든 사람 · 라이선스 · 주소를 적으면 설정 서랍에 표시됩니다.
- 이 정리는 작성 시점 기준입니다. 받기 전에 각 사이트의 최신 라이선스를 꼭 확인하세요.

## 설정 바꾸기 (js/script.js 맨 위 `CONFIG`)

| 항목 | 설명 |
| --- | --- |
| `DONATE_URL` | ☕ Support 버튼이 열 주소. 비어 있으면 버튼을 눌렀을 때 안내만 나옵니다. |
| `DEFAULT_VOLUME` | 처음 접속했을 때 볼륨 (기본 70) |
| `DEFAULT_BACKGROUND` | 아무 소리도 안 켰을 때 배경 |
| `LANGUAGE` | `'auto'`(기본) · `'en'` · `'ko'`. 방문자가 서랍에서 고른 언어가 우선입니다. |
| `CLOCK_FORMAT` | `'auto'`(기본, 지역 설정을 따름) · `'12'` · `'24'` |
| `SLEEP_TIMER_MINUTES` | 슬립 타이머 선택지 (기본 15 · 30 · 60 · 90분) |
| `FADE_MS` | 전환 · 끄기 · 일시정지 · 다시 재생 · 트랙 변경 · 슬립 타이머 종료(기본 20초) 페이드 시간 |
| `LOOP_CROSSFADE_SEC` | 반복 지점 크로스페이드 (0이면 브라우저 기본 반복) |
| `PLAYLIST_CROSSFADE_SEC` | 음악 카테고리에서 다음 곡으로 넘어갈 때 크로스페이드 |

- **화면 문구**는 `I18N`의 `en`(영어) · `ko`(한국어)에서 고칩니다. 두 언어 모두 같은 항목이 있어야 합니다.
- **카테고리 이름 · 트랙 제목**은 `SOUND_DATA`의 `name` · `title`에서 `{ "en": "...", "ko": "..." }` 형태로 고칩니다.
  트랙을 추가·삭제하면 도크와 드롭다운이 자동으로 따라 바뀝니다.
- **음악 카테고리**는 `playMode: "playlist"`라서, 트랙을 'Random'으로 두면 곡이 끝날 때 다른 곡으로 이어집니다.
  트랙을 하나 고르면 그 곡만 반복합니다.

## 사용법

| 조작 | 동작 |
| --- | --- |
| 도크 아이콘 클릭 | 그 소리 켜기 (한 번에 하나만 재생, 다른 아이콘을 누르면 소리와 배경이 함께 바뀜) |
| 켜진 아이콘 다시 클릭 | 끄기 |
| `Space` | 재생 / 일시정지 (뚝 끊기지 않게 페이드) |
| `M` | 음소거 켜고 끄기 (볼륨 값은 그대로 기억) |
| `1` ~ `8` | 도크 순서대로 소리 바로 고르기 |
| `Esc` | 설정 서랍 닫기 |
| 우측 하단 톱니바퀴 | 볼륨 · 트랙 · 슬립 타이머 · 음소거 · 언어 · 후원 버튼이 있는 설정 서랍 |
| 슬립 타이머 | 15 · 30 · 60 · 90분 중 고르면, 시간이 됐을 때 20초 동안 천천히 줄인 뒤 일시정지 (Space로 다시 재생) |

- 단축키는 **이 탭이 활성화되어 있을 때만** 동작합니다.
- 볼륨(카테고리별), 고른 트랙, 음소거, 언어는 브라우저에 저장되어 다음 접속 때 복원됩니다. 슬립 타이머는 저장하지 않습니다.
- 키보드의 재생/일시정지 미디어 키와도 연결해 두었습니다. (브라우저에 따라 동작이 다를 수 있습니다)

## GitHub Pages로 배포하기

1. GitHub에서 새 저장소를 **Public**으로 만듭니다. (무료 계정은 공개 저장소에서만 Pages를 쓸 수 있습니다)
2. 이 폴더 안의 파일을 모두 올립니다. `index.html`이 저장소 맨 위에 있어야 합니다.
3. 저장소의 **Settings → Pages → Build and deployment → Source**에서 **Deploy from a branch**를 고르고,
   브랜치 `main`, 폴더 `/ (root)`를 선택한 뒤 **Save**를 누릅니다.
4. 잠시 뒤 `https://아이디.github.io/저장소이름/` 주소로 열립니다.

모든 경로가 상대 경로(`assets/...`)라서 저장소 이름과 상관없이 동작합니다.
GitHub Pages에는 사이트 크기 1GB, 월 100GB 트래픽(소프트 제한)이 있으니 너무 큰 소리 파일은 피하세요.

## 알려진 제한

- **아이폰 · 아이패드는 지원하지 않습니다.** 브라우저가 볼륨 조절을 막아서 볼륨 슬라이더와 페이드가 동작하지 않습니다.
  (재생과 음소거는 됩니다. 이 경우 설정 서랍에 안내 문구가 나옵니다.)
- 브라우저는 사용자가 누르기 전에는 소리를 재생하지 못하게 합니다. 그래서 다시 접속해도 소리가 자동으로 켜지지는 않습니다.
- 글꼴(Pretendard, Galmuri)은 인터넷에서 불러옵니다. 인터넷이 없으면 기본 글꼴로 보입니다.
- 동작 확인은 크롬(Chromium) 기준입니다. 사파리 · 파이어폭스에서는 확인하지 못했습니다.

## 들어 있는 소리

`whitenoise_1~3.mp3`는 프로그램(ffmpeg)으로 직접 생성한 화이트 · 핑크 · 브라운 노이즈입니다 (각 60초).
외부 에셋이 아니라서 따로 출처 표기가 필요 없습니다. 다른 소리로 바꾸고 싶으면 같은 이름으로 덮어쓰면 됩니다.
