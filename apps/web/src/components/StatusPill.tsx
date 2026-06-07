import type { DeviceStatus, AlertLevel } from "@nimbus/shared-types";

const STATUS_LABEL: Record<DeviceStatus, string> = {
  online: "Онлайн",
  warn: "Внимание",
  err: "Ошибка",
  offline: "Офлайн",
};

const STATUS_CLASS: Record<DeviceStatus, string> = {
  online: "ok",
  warn: "warn",
  err: "err",
  offline: "offline",
};

export function StatusPill({ status }: { status: DeviceStatus }) {
  return (
    <span className={`pill ${STATUS_CLASS[status]}`}>
      <span className="dot" /> {STATUS_LABEL[status]}
    </span>
  );
}

const LEVEL_CLASS: Record<AlertLevel, string> = {
  err: "err",
  warn: "warn",
  info: "info",
  ok: "ok",
};

export function LevelPill({ level }: { level: AlertLevel }) {
  return <span className={`pill ${LEVEL_CLASS[level]}`}>{level}</span>;
}
