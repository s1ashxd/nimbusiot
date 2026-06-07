# Handoff: Nimbus IoT — клиентская часть панели управления

## Обзор

Дашборд для мониторинга и настройки IoT-устройств (умный дом / промышленный смешанный парк). Разработан как клиентская часть курсовой работы. Покрывает основные сценарии оператора: видеть состояние парка, реагировать на алерты, открывать устройство и менять его настройки, описывать сценарии автоматизации.

## О файлах в этом пакете

Все файлы (`*.html`, `*.jsx`, `*.css`) — это **дизайн-референсы, реализованные на HTML/React (через Babel-standalone в браузере)**. Это не production-код для копирования. Задача — **воссоздать эти экраны в целевой кодовой базе** с её собственным стеком (React + TS + Tailwind/MUI/shadcn, Vue, SwiftUI и т.п.), используя её систему компонентов и токенов. Если кодовой базы ещё нет — выбрать стек, наиболее подходящий проекту (рекомендуется **React + TypeScript + Vite**, состояние через React Query / Zustand, графики через Recharts или uPlot, темизация через CSS-переменные).

## Уровень детализации

**High-fidelity (hifi)** — финальная цветовая палитра, типографика, отступы, иконки, состояния и микро-взаимодействия. Воспроизводить максимально близко к референсу.

## Архитектура приложения

Одностраничное SPA с фиксированным «двухзонным» лэйаутом:

```
┌────────────┬─────────────────────────────────────┐
│            │             Topbar (56px)           │
│  Sidebar   ├─────────────────────────────────────┤
│   240px    │                                     │
│            │             Main (router outlet)    │
│            │                                     │
└────────────┴─────────────────────────────────────┘
```

CSS grid:
```css
grid-template-columns: 240px 1fr;
grid-template-rows: 56px 1fr;
grid-template-areas: "sidebar topbar" "sidebar main";
```

### Маршруты

| Route | Покрытие | Файл-референс |
|---|---|---|
| `/overview` | KPI-сводка, графики метрик, состояние сети, сценарии, активность, мини-карточки устройств | `pages-overview.jsx` |
| `/devices` | Список устройств (таблица + сетка), фильтры, bulk-действия | `pages-devices.jsx` |
| `/devices/:id` | Карточка устройства, 5 вкладок: Обзор / Настройки / Правила / История / Диагностика | `pages-devices.jsx` |
| `/automation` | Сценарии (карточки), конструктор правила «ЕСЛИ → И → ТО» | `pages-misc.jsx` |
| `/alerts` | Список алертов с подтверждением, счётчики по типам | `pages-misc.jsx` |
| `/users` | Пользователи и роли | `pages-misc.jsx` |
| `/settings` | Параметры хаба, безопасность, интеграции | `pages-misc.jsx` |

## Дизайн-токены

### Цвета (тёмная тема — основная)

```css
--bg:         #07091a;  /* фон приложения */
--bg-1:       #0b0f24;  /* поверхность карточек */
--bg-2:       #11162e;  /* инпуты, мини-карты */
--bg-3:       #181d38;  /* hover, sliders track */

--line:       rgba(255,255,255,0.07);
--line-2:     rgba(255,255,255,0.12);

--text:       #e7ecf5;
--text-dim:   #8a93ab;
--text-faint: #5b6480;

--accent:      #00d4ff;        /* основной (cyan) */
--accent-2:    #6ee7ff;        /* hover акцентной кнопки */
--accent-soft: rgba(0,212,255,0.13);

--ok:    #22c55e;  --ok-soft:   rgba(34,197,94,0.14);
--warn:  #fbbf24;  --warn-soft: rgba(251,191,36,0.14);
--err:   #ef4444;  --err-soft:  rgba(239,68,68,0.14);
--info:  #a78bfa;  --info-soft: rgba(167,139,250,0.14);
```

### Цвета (светлая тема — переключатель)

```css
--bg:    #f6f7fa;
--bg-1:  #ffffff;
--bg-2:  #ffffff;
--bg-3:  #f0f2f7;
--line:  rgba(10,15,40,0.08);
--line-2:rgba(10,15,40,0.14);
--text:        #0e1330;
--text-dim:    #5b6480;
--text-faint:  #8a93ab;
```

Активируется через `<html data-theme="light">`.

### Типографика

- Основной шрифт: **Geist** (400/500/600/700) — Google Fonts
- Моноширинный: **Geist Mono** (400/500/600) — для всех числовых значений, ID устройств, временных меток, логов
- `letter-spacing: -0.005em` на body, `-0.02em` на крупных значениях/заголовках
- `font-feature-settings: "ss01","cv01","cv11"` для Geist
- Числа всегда `font-variant-numeric: tabular-nums`

Размеры:
- 22px / 600 — заголовок раздела (`h2`)
- 14px / 600 — заголовок карточки (`h3`)
- 13px — основной текст
- 12px — sub / muted
- 11px / uppercase / letter-spacing 0.06em — лейблы таблиц и метки разделов сайдбара
- 11–11.5px — мета-информация
- 26–32px моно — крупные значения KPI

### Скругления

```css
--r-sm: 6px;
--r-md: 10px;   /* карточки по умолчанию */
--r-lg: 14px;
--r-xl: 20px;
```

### Spacing (4-pixel base)

```css
--space-1: 4px;   --space-2: 8px;
--space-3: 12px;  --space-4: 16px;
--space-5: 20px;  --space-6: 24px;
--space-8: 32px;  --space-10: 40px; --space-12: 48px;
```

### Density (мультипликатор плотности)

```css
[data-density="compact"] { --pad: 12px; --row: 36px; --gap: 10px; }
[data-density="regular"] { --pad: 16px; --row: 44px; --gap: 14px; }
[data-density="comfy"]   { --pad: 22px; --row: 52px; --gap: 18px; }
```

### Тени

После уборки лишних эффектов:
- Карточки — **без теней**, только бордером `1px solid var(--line)` на фоне `--bg-1`.
- Поповеры/модалки — `--shadow-pop: 0 8px 28px rgba(0,0,0,0.35)` (для тёмной).

### Анимации

- `pulse` 1.6s ease-out — кольцо вокруг live-индикатора (только в Alerts на критичных)
- `shimmer` 1.6s linear — скелетоны загрузки
- `tick` 0.4s ease-out — вспышка акцентом при обновлении значения
- Transitions: 0.18s ease на toggle-thumb, 0.6s ease на progress-кольце

## Компоненты UI

### Sidebar (240px)
- Бренд-блок: квадратный mark 28px + название «Nimbus IoT» 13.5/600 + sub «главный хаб · v3.4.0» 11px muted
- Секции «Управление» / «Администрирование», лейбл 10.5px uppercase letter-spacing 0.08em, цвет `--text-faint`
- Пункт меню: иконка 16px + лейбл 13/500, padding 8/10, radius 8, hover `bg-rgba(255,255,255,0.04)`. Активный — фоновый градиент `linear-gradient(90deg, accent-soft, transparent)` + полоска 2px слева высотой пункта в цвете акцента
- Бейджи: число — серый `pill`, точка-алерт — красная 6px с soft-ring 3px
- Подвал: avatar 30px + имя/email + chevron

### Topbar (56px)
- Слева: крошки `Главная / Раздел`, иконка дашборда 14px
- Справа: время последнего обновления (mono 12px muted) → icon-btn refresh → icon-btn bell с красной точкой 7px
- Граница снизу `1px solid --line`, фон `rgba(7,9,26,0.55)` + `backdrop-filter: blur(12px)`

### Кнопки

| Класс | Высота | Фон | Border | Цвет |
|---|---|---|---|---|
| `.btn` | 32 | `--bg-2` | `--line` | `--text` |
| `.btn.primary` | 32 | `--accent` | transparent | `#001018` |
| `.btn.ghost` | 32 | transparent | transparent | `--text-dim` |
| `.btn.sm` | 26 | — | — | font 12 |

Padding 0/12, radius 8, font 13/500.

### Карточка (`.card`)
- Фон `--bg-1`, border `1px solid --line`, radius 10
- `.card-hd`: высота ~46px, padding 14/16, нижняя граница; `<h3>` 13/600 + `.sub` 12 muted + `.right` справа
- `.card-bd`: padding 16

### KPI-тайл
```
┌─────────────────────────────────┐
│ LABEL                  [icon]   │  ← label 12px dim
│ 12 / 14                         │  ← value 28px mono
│ ↑ +1 за 24ч            ▁▂▃▅▄   │  ← delta 12px ok/err + sparkline
└─────────────────────────────────┘
```
Сетка: `repeat(4, 1fr)`, gap `--gap` (по плотности).

Цветовые тона: `.ok | .warn | .err | accent` — только иконка справа сверху (28px квадрат с radius 8, фон tone-soft, цвет tone).

### Status pills
- Высота 22, radius 999, padding 0/8, font 11.5/500, gap 6
- Цвета: `.ok` (green-soft + green), `.warn`, `.err`, `.info`, `.accent`
- Слева — точка 6px того же цвета. Опционально — пульсирующее кольцо для live (только в критичных местах)

### Таблица (`.table`)
- Заголовок: 11/500/uppercase/letter-spacing 0.06em, фон `--bg-1`, sticky top
- Строки: padding 12/14, нижняя граница `--line`, hover `bg-rgba(255,255,255,0.02)`
- Selected: фон `--accent-soft`
- Числа — моно с tabular-nums

### Формы
- `.input`, `.select`: высота 34, padding 0/10, фон `--bg-2`, border `--line`, radius 8
- Focus: border `--accent` + ring `0 0 0 3px --accent-soft`
- `.toggle`: 36×20, track `--bg-3`, thumb 16px. On — track `--accent-soft` + border `--accent` + thumb `--accent`, transform 16px
- `.slider`: track 4px `--bg-3`, thumb 16px `--accent` с soft-ring 4px
- `.seg`: сегментированный контрол. Фон `--bg-2`, padding 2, активный сегмент `--bg-3` + `--text`

### Графики (SVG inline)

| Компонент | Реализация |
|---|---|
| `Sparkline` | path с заливкой 15% + линия 1.4px round, без осей. Размер по необходимости |
| `AreaChart` | многосерийный, линейный градиент 35→0% под линией, dot 3.5px + soft 6px на последней точке. Оси: 4 y-tick, 5 x-tick (00/06/12/18/24), цвет осей `currentColor opacity 0.5`, моно 10px |
| `BarChart` | radius 3, fillOpacity 0.85, лейбл под баром моно 10 |
| `Donut` | track + arc, strokeLinecap round, центр текст моно ~22% размера |
| `SignalBars` | 5 баров высотой по шкале, неактивные `opacity 0.2` |
| `BatteryIndicator` | корпус-рамка + заливка по %, цвет по уровню: <20 err / <40 warn / иначе ok |

### Сценарии (карточка)
- Иконка 40×40, radius 10, фон `colorHex + "22"`, цвет акцента-сценария
- Название 14.5/600, sub 12 muted
- Тогглы инлайн справа
- Низ — pills `пиктограмма + текст`, маленькая ghost-кнопка «Запустить/Изменить»

### Конструктор правил
Три цветных блока (`trigger` cyan, `condition` violet, `action` green):
- Контейнер: border тонкого тона, фон 5% того же цвета, radius 10, padding 14
- Заголовок маленький uppercase letter-spacing 0.12em в цвете тона
- Каждая строка — карточка `--bg-1` border `--line`, padding 10/12, gap 12, slots для edit / x

### Алерты
- Карточка с тремя колонками: иконка 36 (с пульсом если активный err/warn) | тело | действия
- Acknowledged: opacity 0.6
- Заголовок 14/600 + pill уровня + (опц.) pill «подтверждено»
- Мета снизу: время mono / device-id mono / комната

## Состояние (state)

```ts
type Route = "overview" | "devices" | "device" | "automation"
           | "alerts" | "users" | "settings";

interface AppState {
  route: Route;
  selectedDeviceId: string | null;
  lastUpdate: Date;
  tweaks: {
    theme: "dark" | "light";
    accent: string;             // hex
    density: "compact" | "regular" | "comfy";
    fontSize: number;           // 12..18
    radius: number;             // 2..20
    live: boolean;              // тикалка вкл/выкл
  };
}
```

Per-страница:
- **Devices**: `view: "table"|"grid"`, `filter: status`, `room`, `selectedIds: Set<string>`
- **DeviceDetail**: активная вкладка, локальные значения тогглов/слайдеров (auto, target, brightness, reporting)
- **Alerts**: `filter: "active"|"all"|"err"|"warn"|"info"`, `ackedIds`
- **Automation**: список сцен с toggle on/off

## Данные

См. `data.jsx` — там готовые mock-структуры:

```ts
interface Device {
  id: string;             // "DEV-A1F2"
  name: string;
  type: "thermo"|"light"|"lock"|"camera"|"motion"|"smoke"|"energy"|"fan"|"hub";
  room: string;
  status: "online"|"warn"|"err"|"offline";
  battery: number | null;  // %
  signal: 0..5;
  value: string | number;
  unit: string;
  lastSeen: string;
  fw: string;
  warnText?: string;
}

interface Alert {
  id: number;
  level: "err"|"warn"|"info"|"ok";
  title: string;
  device: string;
  room: string;
  time: string;
  ack: boolean;
  desc: string;
}

interface Scene {
  id: number;
  name: string;
  icon: string;
  trigger: string;
  actions: number;
  on: boolean;
  color: string;
}
```

Серии: 48 точек за 24 часа (детерминированный seed-генератор) — `temp`, `humidity`, `power`, `network`.

## Иконки

Кастомный набор stroke-иконок (24×24 viewBox, stroke 1.6, round caps/joins). Используются по имени: `dashboard, devices, automation, alerts, settings, users, search, bell, plus, filter, more, refresh, download, chevron-right/down, thermometer, drop, wind, bolt, wifi, battery, lock, lightbulb, camera, cpu, play, pause, arrow-up/down, check, x, clock, edit, trash, eye, shield, fan, smoke, motion, leaf, send, globe, sun, moon`.

В production можно заменить на **Lucide** или **Tabler Icons** — оба stroke-based и совместимы по визуалу.

## Поведение и переходы

- Клик по строке устройства / мини-карточке → `/devices/:id` (вкладка Обзор)
- Кнопка «Назад» в шапке устройства → `/devices`
- Перезагрузка топбара (refresh-btn) обновляет timestamp
- Live-tikка интервалом 4с при `tweaks.live = true`
- Подтверждение алерта — установить `ack=true`, оставить в списке с opacity 0.6
- Тогглы сценариев применяются оптимистично
- Все мутации форм — локальные (мок); в реальной интеграции — debounced PUT/POST + оптимистичное обновление + откат при ошибке

## Tweaks-панель (live customization)

Плавающая правая нижняя панель — для демо в курсовой. Не часть продакшен-UI. Контролы:
- Theme (segmented): dark / light → переключает `data-theme`
- Accent (6 swatches): cyan / green / violet / orange / amber / pink → CSS-variable `--accent`
- Density (segmented): compact / regular / comfy → `data-density`
- Font size (slider 12–18): root `font-size`
- Radius (slider 2–20): `--r-md/sm/lg`
- Live toggle: pause/resume timestamps

## Адаптивность

Дизайн ориентирован на десктоп 1280–1920px. Сайдбар фиксирован 240px, основная сетка — карточные строки по `repeat(4, 1fr)` для KPI и `1.7fr 1fr` / `1.4fr 1fr 1.2fr` для составных рядов. Для адаптации под ≤1024px:
- Свернуть сайдбар в icon-only (60px) на 1024–1280
- Сложить KPI в `repeat(2, 1fr)` на <1024
- Скрыть колонки таблицы по приоритету: Сигнал → Батарея → Тренд → Время

## Что НЕ нужно копировать дословно

- Реализацию через `<script type="text/babel">` — это только для прототипирования. В реальной кодовой базе используйте TS-модули и сборку
- `window.MOCK`, `window.Pages`, `window.Charts` — глобалы только для удобства Babel-loader'а
- Inline-стили JSX лучше перевести в utility classes (Tailwind) или CSS-modules вашей кодовой базы

## Файлы в этом пакете

```
.
├── README.md                         ← этот файл
├── Nimbus IoT Dashboard.html         ← точка входа, шапка темизации, роутинг
├── styles.css                        ← все CSS-токены и компоненты
├── icons.jsx                         ← inline SVG-иконки
├── data.jsx                          ← мок-данные и генератор серий
├── charts.jsx                        ← Sparkline / AreaChart / BarChart / Donut / SignalBars / Battery
├── shell.jsx                         ← Sidebar / Topbar / StatusPill / SectionHead
├── pages-overview.jsx                ← Главная: KPI, графики, активность, мини-карточки
├── pages-devices.jsx                 ← Список + детальная карточка устройства (5 вкладок)
├── pages-misc.jsx                    ← Automation / Alerts / Users / Settings
└── tweaks-panel.jsx                  ← Контролы темизации (для демо)
```

Чтобы запустить референс локально — откройте `Nimbus IoT Dashboard.html` в браузере (можно через `python -m http.server`, чтобы Babel мог подгрузить относительные скрипты).

## Рекомендации по реализации

1. **Стек**: React 18 + TypeScript + Vite + React Router. Tailwind или vanilla CSS modules с CSS-variables (последнее ближе к референсу).
2. **Графики**: Recharts (готов) или uPlot (быстрее, кастомнее). SVG в `charts.jsx` достаточно просты, чтобы переписать на Recharts за пару часов.
3. **Состояние**: Zustand для `tweaks` и сессионного UI, React Query для устройств/алертов/сценариев.
4. **Бэкенд (предположение)**: REST + WebSocket для live-обновлений значений датчиков и алертов. WebSocket payload `{ deviceId, value, ts }` → optimistic patch кэша.
5. **Темизация**: data-атрибуты на `<html>` (как в референсе) + CSS-переменные — это даст и runtime-переключение, и SSR-сохранение без mismatch.
6. **Иконки**: подключите Lucide (`lucide-react`) и сопоставьте имена 1:1 — все используемые есть в Lucide.
7. **Шрифты**: Geist через `@vercel/font` или Google Fonts. На fallback — `ui-sans-serif, system-ui`.
8. **Доступность**: пройдитесь по табуляции, добавьте `aria-label` на icon-btn'ы, `role="status"` на live-индикаторы, контраст текста проверить на светлой теме (некоторые `text-faint` могут не дотянуть до AA).

## Открытые вопросы для уточнения

- Какой реальный бэкенд / протокол (MQTT, REST, gRPC)?
- Нужна ли мультитенантность (несколько домов / объектов)?
- Локализация — только ru или multi-locale?
- Мобильное приложение или адаптив на тех же экранах?
- Какие из мок-устройств соответствуют реальному парку (типы датчиков, единицы измерения)?
