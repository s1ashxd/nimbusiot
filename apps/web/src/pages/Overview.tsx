import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import type { DashboardSummary, SceneDto, ActivityDto, AlertDto } from "@nimbus/shared-types";
import { useRealtime } from "../lib/ws";
import { useCallback } from "react";

interface EnergyByRoom { room: string; kw: number }
interface EnergyTrendPoint { t: string; kw: number }
interface ActivityList { items: ActivityDto[]; total: number }
interface AlertsList { items: AlertDto[]; total: number }
interface ScenesList { items: SceneDto[]; total: number }

export function Overview() {
  useRealtime(useCallback(() => {
    /* live updates pass through React Query refetch intervals */
  }, []));

  const summary = useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],
    queryFn: () => api.get<DashboardSummary>("/dashboard/summary"),
    refetchInterval: 15000,
  });
  const energy = useQuery<EnergyByRoom[]>({
    queryKey: ["energy-by-room"],
    queryFn: () => api.get<EnergyByRoom[]>("/dashboard/energy-by-room"),
    refetchInterval: 30000,
  });
  const trend = useQuery<EnergyTrendPoint[]>({
    queryKey: ["energy-trend"],
    queryFn: () => api.get<EnergyTrendPoint[]>("/dashboard/energy-trend"),
    refetchInterval: 30000,
  });
  const activity = useQuery<ActivityList>({
    queryKey: ["overview-activity"],
    queryFn: () => api.get<ActivityList>("/activity?page=0&size=8"),
    refetchInterval: 10000,
  });
  const scenes = useQuery<ScenesList>({
    queryKey: ["scenes"],
    queryFn: () => api.get<ScenesList>("/scenes"),
  });
  const alerts = useQuery<AlertsList>({
    queryKey: ["overview-alerts"],
    queryFn: () => api.get<AlertsList>("/alerts?status=firing"),
    refetchInterval: 10000,
  });

  const trendData = (trend.data ?? []).map((p) => ({
    label: new Date(p.t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    kw: p.kw,
  }));

  return (
    <div>
      <div className="page-h">
        <div>
          <h1>Обзор</h1>
          <div className="sub">Состояние умного дома в реальном времени</div>
        </div>
      </div>

      {summary.isError && (
        <div className="card" style={{ marginBottom: 16, color: "var(--err)" }}>
          Не удалось загрузить данные панели. Проверьте соединение с сервером — запросы повторяются автоматически.
        </div>
      )}

      <div className="grid cols-4">
        <KpiTile label="Устройств" value={summary.data?.deviceCount ?? "—"} />
        <KpiTile label="Онлайн" value={summary.data?.online ?? "—"} accent="ok" />
        <KpiTile label="Внимание" value={summary.data?.warning ?? "—"} accent="warn" />
        <KpiTile label="Активные тревоги" value={summary.data?.alertsFiring ?? "—"} accent="err" />
      </div>

      <div className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-h">
            <h3>Средняя мощность за 24 ч</h3>
            <span className="sub">кВт</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="label" stroke="var(--text-faint)" minTickGap={24} />
                <YAxis stroke="var(--text-faint)" tickFormatter={(v) => `${v} кВт`} width={64} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-2)", border: "1px solid var(--line)" }}
                  labelFormatter={(label) => `Время: ${label}`}
                  formatter={(v: number) => [`${v} кВт`, "Нагрузка"]}
                />
                <Area type="monotone" dataKey="kw" stroke="var(--accent)" fill="url(#g1)" name="Нагрузка" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-h">
            <h3>Средняя нагрузка по комнатам</h3>
            <span className="sub">кВт</span>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={energy.data ?? []} margin={{ top: 8, right: 16, bottom: 24, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis
                  dataKey="room"
                  stroke="var(--text-faint)"
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={48}
                />
                <YAxis stroke="var(--text-faint)" tickFormatter={(v) => `${v} кВт`} width={64} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-2)", border: "1px solid var(--line)" }}
                  labelFormatter={(label) => `Комната: ${label}`}
                  formatter={(v: number) => [`${v} кВт`, "Нагрузка"]}
                />
                <Bar dataKey="kw" fill="var(--accent)" radius={[6, 6, 0, 0]} name="Нагрузка" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="card-h">
            <h3>Сценарии</h3>
            <span className="sub">{scenes.data?.total ?? 0} активных</span>
          </div>
          <div className="grid cols-2">
            {scenes.data?.items.map((s) => (
              <div key={s.id} className="scene-card">
                <div className="top">
                  <div className="icon" style={{ background: "var(--accent-soft)", color: s.color }}>●</div>
                  <span className={`pill ${s.enabled ? "ok" : "offline"}`}>{s.enabled ? "Активен" : "Выкл"}</span>
                </div>
                <div className="name">{s.name}</div>
                <div className="meta">{s.trigger}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-h">
            <h3>Последние события</h3>
            <span className="sub">{activity.data?.total ?? 0} всего</span>
          </div>
          <div>
            {activity.data?.items.map((a) => (
              <div className="activity-row" key={a.id}>
                <div className="ts">{new Date(a.ts).toLocaleTimeString("ru-RU")}</div>
                <div><span className={`pill ${a.level}`}>{a.level}</span></div>
                <div className="scope">{a.scope}</div>
                <div>{a.message}</div>
              </div>
            ))}
            {!activity.data?.items.length && <div className="sub">Нет событий</div>}
          </div>
        </div>
      </div>

      {!!alerts.data?.items.length && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-h"><h3>Активные тревоги</h3></div>
          <table className="table">
            <thead><tr><th>Уровень</th><th>Заголовок</th><th>Устройство</th><th>Открыта</th></tr></thead>
            <tbody>
              {alerts.data.items.map((al) => (
                <tr key={al.id}>
                  <td data-label="Уровень"><span className={`pill ${al.level}`}>{al.level}</span></td>
                  <td data-label="Заголовок">{al.title}</td>
                  <td data-label="Устройство" className="sub">{al.device?.name ?? "—"}</td>
                  <td data-label="Открыта" className="sub">{new Date(al.startedAt).toLocaleString("ru-RU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KpiTile({ label, value, accent }: { label: string; value: number | string; accent?: "ok" | "warn" | "err" }) {
  return (
    <div className="card kpi">
      <span className="label">{label}</span>
      <span className="value" style={accent ? { color: `var(--${accent})` } : undefined}>{value}</span>
    </div>
  );
}

