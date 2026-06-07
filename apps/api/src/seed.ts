import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Passw0rd!", 12);

  // roles
  await prisma.role.upsert({ where: { id: "viewer" }, update: {}, create: { id: "viewer", description: "Read-only viewer" } });
  await prisma.role.upsert({ where: { id: "operator" }, update: {}, create: { id: "operator", description: "Operator with write access" } });
  await prisma.role.upsert({ where: { id: "admin" }, update: {}, create: { id: "admin", description: "Administrator" } });

  // users
  const users = [
    { email: "admin@nimbus.local", fullName: "Кирилл Соколов", role: "admin" },
    { email: "operator@nimbus.local", fullName: "Анна Соколова", role: "operator" },
    { email: "viewer@nimbus.local", fullName: "Даня Соколов", role: "viewer" },
  ];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, passwordHash: hash },
      create: { email: u.email, fullName: u.fullName, passwordHash: hash },
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: u.role } },
      update: {},
      create: { userId: user.id, roleId: u.role },
    });
  }

  // rooms
  const rooms = [
    { id: "room-living", name: "Гостиная", floor: "1", area: 32 },
    { id: "room-bed", name: "Спальня", floor: "2", area: 18 },
    { id: "room-kitchen", name: "Кухня", floor: "1", area: 14 },
    { id: "room-office", name: "Кабинет", floor: "2", area: 12 },
    { id: "room-entry", name: "Прихожая", floor: "1", area: 6 },
    { id: "room-bath", name: "Ванная", floor: "1", area: 8 },
    { id: "room-garage", name: "Гараж", floor: "0", area: 24 },
    { id: "room-yard", name: "Двор", floor: "0", area: 60 },
  ];
  for (const r of rooms) {
    await prisma.room.upsert({ where: { id: r.id }, update: r, create: r });
  }

  // devices (14 — match handoff)
  const devices: Array<{
    id: string;
    name: string;
    type: any;
    roomId: string;
    status?: any;
    battery?: number | null;
    signal?: number;
    valueText?: string;
    unit?: string;
    fw?: string;
    warnText?: string | null;
  }> = [
    { id: "DEV-HUB1", name: "Nimbus Hub", type: "hub", roomId: "room-living", status: "online", signal: 5, valueText: "Online", fw: "2.3.1" },
    { id: "DEV-A1F2", name: "Термостат гостиная", type: "thermo", roomId: "room-living", battery: 78, status: "online", valueText: "22.4", unit: "°C", fw: "1.4.0" },
    { id: "DEV-A1F3", name: "Термостат спальня", type: "thermo", roomId: "room-bed", battery: 91, status: "online", valueText: "21.0", unit: "°C", fw: "1.4.0" },
    { id: "DEV-LT01", name: "Свет гостиная", type: "light", roomId: "room-living", status: "online", valueText: "80", unit: "%", fw: "1.1.4" },
    { id: "DEV-LT02", name: "Свет кухня", type: "light", roomId: "room-kitchen", status: "online", valueText: "60", unit: "%", fw: "1.1.4" },
    { id: "DEV-LK01", name: "Замок входной", type: "lock", roomId: "room-entry", battery: 64, status: "online", valueText: "Закрыт", fw: "0.9.2" },
    { id: "DEV-CM01", name: "Камера двор", type: "camera", roomId: "room-yard", status: "warn", valueText: "Recording", fw: "3.0.1", warnText: "Слабый сигнал Wi-Fi" },
    { id: "DEV-MT01", name: "Датчик движения кабинет", type: "motion", roomId: "room-office", battery: 33, status: "warn", valueText: "Detected", fw: "1.0.7", warnText: "Низкий заряд батареи" },
    { id: "DEV-SM01", name: "Датчик дыма кухня", type: "smoke", roomId: "room-kitchen", battery: 88, status: "online", valueText: "Norm", fw: "2.0.0" },
    { id: "DEV-EN01", name: "Энергомер вход", type: "energy", roomId: "room-entry", status: "online", valueText: "1.42", unit: "кВт", fw: "1.2.0" },
    { id: "DEV-FN01", name: "Вентилятор ванная", type: "fan", roomId: "room-bath", status: "offline", valueText: "Off", fw: "1.0.0", warnText: "Нет связи" },
    { id: "DEV-MT02", name: "Датчик движения двор", type: "motion", roomId: "room-yard", battery: 71, status: "online", valueText: "Idle", fw: "1.0.7" },
    { id: "DEV-LT03", name: "Свет гараж", type: "light", roomId: "room-garage", status: "online", valueText: "Off", fw: "1.1.4" },
    { id: "DEV-CM02", name: "Камера прихожая", type: "camera", roomId: "room-entry", status: "online", valueText: "Idle", fw: "3.0.1" },
  ];
  for (const d of devices) {
    await prisma.device.upsert({
      where: { id: d.id },
      update: {
        name: d.name,
        type: d.type,
        roomId: d.roomId,
        status: d.status ?? "online",
        battery: d.battery ?? null,
        signal: d.signal ?? 5,
        valueText: d.valueText ?? "",
        unit: d.unit ?? "",
        fw: d.fw ?? "0.0.0",
        warnText: d.warnText ?? null,
      },
      create: {
        id: d.id,
        name: d.name,
        type: d.type,
        roomId: d.roomId,
        status: d.status ?? "online",
        battery: d.battery ?? null,
        signal: d.signal ?? 5,
        valueText: d.valueText ?? "",
        unit: d.unit ?? "",
        fw: d.fw ?? "0.0.0",
        warnText: d.warnText ?? null,
      },
    });
  }

  // scenes
  const scenes = [
    { name: "Доброе утро", icon: "sunrise", color: "#f59e0b" },
    { name: "Никого нет дома", icon: "lock", color: "#64748b" },
    { name: "Кино-режим", icon: "film", color: "#a855f7" },
    { name: "Спокойной ночи", icon: "moon", color: "#3b82f6" },
    { name: "Тревога: утечка", icon: "alert-triangle", color: "#ef4444" },
    { name: "Энергосбережение", icon: "leaf", color: "#10b981" },
  ];
  for (const s of scenes) {
    const existing = await prisma.scene.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.scene.create({ data: s });
    }
  }

  // alerts — only if none exist (avoid duplicate spam on reseed)
  const existingAlertsCount = await prisma.alert.count();
  if (existingAlertsCount === 0) {
    const seedAlerts = [
      { deviceId: "DEV-CM01", level: "warn" as const, title: "Слабый сигнал камеры двор", description: "RSSI -76 dBm", status: "firing" as const },
      { deviceId: "DEV-MT01", level: "warn" as const, title: "Низкий заряд батареи", description: "33% — заменить в ближайшее время", status: "firing" as const },
      { deviceId: "DEV-FN01", level: "err" as const, title: "Устройство офлайн", description: "Нет связи 18 минут", status: "firing" as const },
      { deviceId: "DEV-A1F2", level: "info" as const, title: "Калибровка завершена", description: "Термостат гостиная — успех", status: "ack" as const, acknowledgedAt: new Date(Date.now() - 3_600_000) },
      { deviceId: "DEV-SM01", level: "ok" as const, title: "Тест датчика дыма", description: "Система функционирует", status: "ack" as const, acknowledgedAt: new Date(Date.now() - 7_200_000) },
      { deviceId: "DEV-HUB1", level: "info" as const, title: "Обновление прошивки", description: "Hub 2.3.1 установлено", status: "ack" as const, acknowledgedAt: new Date(Date.now() - 10_800_000) },
    ];
    for (const a of seedAlerts) {
      await prisma.alert.create({ data: a });
    }
  }

  // baseline activity
  const baselineActivity = [
    { level: "ok" as const, scope: "system" as const, message: "Nimbus IoT v1.0 запущен" },
    { level: "info" as const, scope: "network" as const, message: "Хаб подключён к локальной сети" },
    { level: "info" as const, scope: "device" as const, message: "Обнаружено 14 устройств" },
    { level: "ok" as const, scope: "automation" as const, message: "6 сценариев активны" },
    { level: "info" as const, scope: "user" as const, message: "Администратор Кирилл вошёл в систему" },
  ];
  const activityCount = await prisma.activityLog.count();
  if (activityCount < 5) {
    for (const a of baselineActivity) {
      await prisma.activityLog.create({ data: a });
    }
  }

  // integrations
  const integrations = ["apple_home", "google_home", "telegram", "mqtt", "home_assistant", "webhook", "ifttt", "zigbee2mqtt"];
  for (const kind of integrations) {
    const existing = await prisma.integration.findFirst({ where: { kind } });
    if (!existing) {
      await prisma.integration.create({ data: { kind, enabled: false, config: {} } });
    }
  }

  console.log("Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
