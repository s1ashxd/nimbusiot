export type Role = "viewer" | "operator" | "admin";

export type DeviceType =
  | "thermo"
  | "light"
  | "lock"
  | "camera"
  | "motion"
  | "smoke"
  | "energy"
  | "fan"
  | "hub";

export type DeviceStatus = "online" | "warn" | "err" | "offline";

export type AlertLevel = "err" | "warn" | "info" | "ok";

export type AlertStatus = "firing" | "ack" | "resolved";

export type ActivityScope =
  | "device"
  | "system"
  | "network"
  | "user"
  | "automation";

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  avatar: string | null;
  roles: Role[];
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserDto;
  accessToken: string;
  expiresAt: string;
}

export interface RoomDto {
  id: string;
  name: string;
  floor: string | null;
  area: number | null;
  deviceCount?: number;
}

export interface DeviceDto {
  id: string;
  name: string;
  type: DeviceType;
  room: { id: string; name: string };
  status: DeviceStatus;
  battery: number | null;
  signal: number;
  valueText: string;
  unit: string;
  fw: string;
  warnText: string | null;
  lastSeenAt: string;
  metricsLatest?: Record<string, number>;
}

export interface AlertDto {
  id: string;
  level: AlertLevel;
  status: AlertStatus;
  title: string;
  description: string;
  device: { id: string; name: string; room: { id: string; name: string } } | null;
  startedAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  durationSeconds: number;
}

export interface SceneDto {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  trigger: string;
  actionsCount: number;
  runs24h: number;
}

export interface ActivityDto {
  id: string;
  ts: string;
  level: AlertLevel;
  scope: ActivityScope;
  deviceId: string | null;
  actorId: string | null;
  message: string;
}

export interface DashboardSummary {
  deviceCount: number;
  online: number;
  warning: number;
  offline: number;
  alertsFiring: number;
  energyKwh: number;
  weatherTempC: number | null;
}

export interface TimeseriesPoint {
  t: string;
  v: number;
}

export interface TimeseriesSeries {
  metric: string;
  deviceId: string;
  points: TimeseriesPoint[];
}

export interface TimeseriesResponse {
  range: { from: string; to: string };
  step: string;
  series: TimeseriesSeries[];
}

export type WsFrame =
  | {
      type: "telemetry";
      deviceId: string;
      metric: string;
      ts: string;
      value: number;
    }
  | { type: "alert.new"; alert: AlertDto }
  | { type: "alert.ack"; alert: AlertDto }
  | { type: "alert.resolved"; alert: AlertDto }
  | { type: "activity"; entry: ActivityDto }
  | { type: "device.update"; device: DeviceDto }
  | { type: "scene.update"; scene: SceneDto }
  | { type: "heartbeat"; serverTime: string }
  | { type: "shutdown" };
