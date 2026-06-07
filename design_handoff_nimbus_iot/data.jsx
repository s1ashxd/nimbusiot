// data.jsx — mock data + tiny chart helpers
const seedRand = (seed) => {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
};

const makeSeries = (n, base, vol, seed = 1) => {
  const r = seedRand(seed);
  const out = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (r() - 0.5) * vol;
    v = Math.max(0, v);
    out.push(+v.toFixed(2));
  }
  return out;
};

const ROOMS = ["Гостиная", "Спальня", "Кухня", "Кабинет", "Прихожая", "Ванная", "Гараж", "Двор"];
const TYPES_META = {
  thermo: { label: "Климат-датчик", icon: "thermometer", unit: "°C" },
  light: { label: "Освещение", icon: "lightbulb", unit: "%" },
  lock: { label: "Замок", icon: "lock", unit: "" },
  camera: { label: "Камера", icon: "camera", unit: "" },
  motion: { label: "Датчик движения", icon: "motion", unit: "" },
  smoke: { label: "Датчик дыма", icon: "smoke", unit: "ppm" },
  energy: { label: "Счётчик", icon: "bolt", unit: "кВт·ч" },
  fan: { label: "Вентиляция", icon: "fan", unit: "rpm" },
  hub: { label: "IoT-хаб", icon: "cpu", unit: "" },
};

const DEVICES = [
  { id: "DEV-A1F2", name: "Датчик климата · Гостиная", type: "thermo", room: "Гостиная", status: "online", battery: 86, signal: 4, value: 22.4, unit: "°C", lastSeen: "сейчас", fw: "2.4.1" },
  { id: "DEV-B7C3", name: "Лампа Hue · Кухня", type: "light", room: "Кухня", status: "online", battery: null, signal: 5, value: 78, unit: "%", lastSeen: "сейчас", fw: "1.92" },
  { id: "DEV-C9D4", name: "Замок входной двери", type: "lock", room: "Прихожая", status: "online", battery: 64, signal: 3, value: "Заперт", unit: "", lastSeen: "5 сек", fw: "3.0.2" },
  { id: "DEV-D2E5", name: "Камера · Двор", type: "camera", room: "Двор", status: "warn", battery: null, signal: 2, value: "1080p", unit: "", lastSeen: "12 сек", fw: "5.1.0", warnText: "Слабый сигнал" },
  { id: "DEV-F4A1", name: "Датчик движения · Кабинет", type: "motion", room: "Кабинет", status: "online", battery: 41, signal: 4, value: "Покой", unit: "", lastSeen: "сейчас", fw: "2.4.1" },
  { id: "DEV-G6B2", name: "Датчик дыма · Кухня", type: "smoke", room: "Кухня", status: "online", battery: 92, signal: 4, value: 4, unit: "ppm", lastSeen: "сейчас", fw: "1.5.3" },
  { id: "DEV-H8C3", name: "Электросчётчик · Гараж", type: "energy", room: "Гараж", status: "online", battery: null, signal: 5, value: 1.84, unit: "кВт", lastSeen: "сейчас", fw: "4.2.0" },
  { id: "DEV-J1K4", name: "Климат · Спальня", type: "thermo", room: "Спальня", status: "online", battery: 78, signal: 5, value: 21.0, unit: "°C", lastSeen: "сейчас", fw: "2.4.1" },
  { id: "DEV-L3M5", name: "Лампа · Гостиная", type: "light", room: "Гостиная", status: "online", battery: null, signal: 5, value: 0, unit: "%", lastSeen: "сейчас", fw: "1.92" },
  { id: "DEV-N5P6", name: "Вентиляция · Ванная", type: "fan", room: "Ванная", status: "online", battery: null, signal: 4, value: 1240, unit: "rpm", lastSeen: "сейчас", fw: "2.0.1" },
  { id: "DEV-Q7R7", name: "Датчик утечки · Ванная", type: "smoke", room: "Ванная", status: "err", battery: 12, signal: 2, value: "Тревога", unit: "", lastSeen: "1 мин", fw: "1.5.3", warnText: "Низкий заряд + утечка" },
  { id: "DEV-S9T8", name: "Хаб Z-Wave", type: "hub", room: "Кабинет", status: "online", battery: null, signal: 5, value: "12 устр.", unit: "", lastSeen: "сейчас", fw: "3.4.0" },
  { id: "DEV-U2V9", name: "Камера · Прихожая", type: "camera", room: "Прихожая", status: "offline", battery: null, signal: 0, value: "—", unit: "", lastSeen: "8 мин", fw: "5.0.7", warnText: "Нет связи" },
  { id: "DEV-W4X1", name: "Датчик окна · Спальня", type: "motion", room: "Спальня", status: "online", battery: 56, signal: 4, value: "Закрыто", unit: "", lastSeen: "сейчас", fw: "2.1.0" },
];

const ALERTS = [
  { id: 1, level: "err", title: "Датчик утечки сработал", device: "DEV-Q7R7", room: "Ванная", time: "11:42", ack: false, desc: "Обнаружена влага на полу. Немедленно проверьте помещение." },
  { id: 2, level: "warn", title: "Камера во дворе: слабый сигнал", device: "DEV-D2E5", room: "Двор", time: "11:31", ack: false, desc: "RSSI -82 дБм, периодические потери кадров." },
  { id: 3, level: "err", title: "Камера прихожей offline", device: "DEV-U2V9", room: "Прихожая", time: "11:28", ack: false, desc: "Устройство не отвечает 8 минут." },
  { id: 4, level: "warn", title: "Низкий заряд: датчик утечки", device: "DEV-Q7R7", room: "Ванная", time: "10:55", ack: true, desc: "Заряд батареи 12%. Замените CR2032." },
  { id: 5, level: "info", title: "Обновление прошивки доступно", device: "DEV-S9T8", room: "Кабинет", time: "09:14", ack: true, desc: "Z-Wave Hub: 3.4.0 → 3.4.2 (улучшения стабильности)." },
  { id: 6, level: "ok", title: "Сценарий «Доброе утро» выполнен", device: "—", room: "—", time: "07:00", ack: true, desc: "Свет, климат и шторы переведены в дневной режим." },
];

const SCENES = [
  { id: 1, name: "Доброе утро", icon: "sun", trigger: "07:00 будни", actions: 6, on: true, color: "#fbbf24" },
  { id: 2, name: "Никого нет дома", icon: "shield", trigger: "Геозона: все ушли", actions: 9, on: true, color: "#a78bfa" },
  { id: 3, name: "Кино-режим", icon: "play", trigger: "Кнопка / голос", actions: 4, on: true, color: "#00d4ff" },
  { id: 4, name: "Спокойной ночи", icon: "moon", trigger: "23:30 ежедневно", actions: 7, on: true, color: "#6ee7ff" },
  { id: 5, name: "Тревога: утечка", icon: "drop", trigger: "Датчик утечки", actions: 5, on: true, color: "#ef4444" },
  { id: 6, name: "Энергосбережение", icon: "leaf", trigger: "Цена > 8 ₽/кВт·ч", actions: 3, on: false, color: "#22c55e" },
];

const ACTIVITY = [
  { time: "11:42:18", level: "err", text: "Датчик утечки DEV-Q7R7 → ТРЕВОГА", scope: "device" },
  { time: "11:42:18", level: "info", text: "Запущен сценарий «Тревога: утечка»", scope: "system" },
  { time: "11:31:04", level: "warn", text: "DEV-D2E5: RSSI упал до -82 дБм", scope: "device" },
  { time: "11:28:47", level: "err", text: "DEV-U2V9 не отвечает (timeout 8мин)", scope: "network" },
  { time: "11:15:00", level: "ok", text: "Резервное копирование завершено (412 МБ)", scope: "system" },
  { time: "11:02:33", level: "info", text: "Пользователь admin@home обновил сценарий «Доброе утро»", scope: "user" },
  { time: "10:55:21", level: "warn", text: "DEV-Q7R7: батарея 12%", scope: "device" },
  { time: "10:30:00", level: "ok", text: "Все 14 устройств в сети, проверка пройдена", scope: "system" },
  { time: "09:14:02", level: "info", text: "FW-обновление доступно: DEV-S9T8 → 3.4.2", scope: "system" },
  { time: "08:12:00", level: "ok", text: "Запущен сценарий «Никого нет дома»", scope: "automation" },
  { time: "07:00:00", level: "ok", text: "Запущен сценарий «Доброе утро»", scope: "automation" },
];

// time-series for graphs (24h, 48 points)
const SERIES = {
  temp: makeSeries(48, 21, 0.6, 7),
  humidity: makeSeries(48, 48, 2.5, 13),
  power: makeSeries(48, 1.6, 0.5, 21),
  network: makeSeries(48, 96, 4, 31),
};
// give power a noticeable evening peak
SERIES.power = SERIES.power.map((v, i) => v + Math.max(0, Math.sin((i / 48) * Math.PI * 2 - 1.5)) * 1.4);

window.MOCK = { DEVICES, ALERTS, SCENES, ACTIVITY, SERIES, TYPES_META, ROOMS, makeSeries, seedRand };
