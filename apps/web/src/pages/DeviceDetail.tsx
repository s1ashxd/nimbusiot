import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api";
import type { DeviceDto, TimeseriesResponse } from "@nimbus/shared-types";
import { StatusPill } from "../components/StatusPill";

type Tab = "overview" | "charts" | "control" | "events" | "diagnostics";

export function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<Tab>("overview");

  const dev = useQuery<DeviceDto>({
    queryKey: ["device", id],
    queryFn: () => api.get<DeviceDto>(`/devices/${id}`),
    enabled: !!id,
    refetchInterval: 10000,
  });

  const metric = primaryMetric(dev.data);
  const ts = useQuery<TimeseriesResponse>({
    queryKey: ["timeseries", id, metric],
    enabled: !!id && !!metric,
    queryFn: () => api.get<TimeseriesResponse>(`/telemetry/timeseries?deviceId=${id}&metric=${metric}&range=24h`),
  });

  if (!dev.data) return <div className="sub">Загрузка…</div>;
  const d = dev.data;
  return (
    <div>
      <div className="page-h">
        <div>
          <div className="sub"><Link to="/devices">← Устройства</Link></div>
          <h1>{d.name}</h1>
          <div className="sub">{d.id} · {d.room.name}</div>
        </div>
        <div><StatusPill status={d.status} /></div>
      </div>

      <div className="tab-strip">
        {(["overview","charts","control","events","diagnostics"] as Tab[]).map((t) => (
          <button
            key={t}
            className="btn"
            style={tab === t ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
            onClick={() => setTab(t)}
          >
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid cols-3">
          <Fact label="Тип" value={d.type} />
          <Fact label="Значение" value={`${d.valueText} ${d.unit}`} />
          <Fact label="Заряд" value={d.battery !== null ? `${d.battery}%` : "—"} />
          <Fact label="Сигнал" value={`${d.signal}/5`} />
          <Fact label="Прошивка" value={d.fw} />
          <Fact label="Последняя активность" value={new Date(d.lastSeenAt).toLocaleString("ru-RU")} />
          {d.warnText && <Fact label="Предупреждение" value={d.warnText} accent="warn" />}
        </div>
      )}

      {tab === "charts" && (
        <div className="card">
          <div className="card-h"><h3>{metric} · 24ч</h3></div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={ts.data?.series[0]?.points.map((p) => ({ t: new Date(p.t).toLocaleTimeString("ru-RU"), v: p.v })) ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="t" stroke="var(--text-faint)" />
                <YAxis stroke="var(--text-faint)" />
                <Tooltip contentStyle={{ background: "var(--bg-2)", border: "1px solid var(--line)" }} />
                <Line type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "control" && (
        <div className="card">
          <div className="card-h"><h3>Управление</h3></div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn primary" onClick={() => api.post(`/devices/${d.id}/poll`)}>Опросить</button>
            <button className="btn" onClick={() => api.post(`/devices/${d.id}/restart`)}>Перезапуск</button>
          </div>
        </div>
      )}

      {tab === "events" && <div className="card sub">Журнал событий (см. /activity?deviceId=…)</div>}
      {tab === "diagnostics" && (
        <div className="grid cols-2">
          <Fact label="Конфигурация" value="—" />
          <Fact label="Параметры сети" value="local-mesh" />
        </div>
      )}
    </div>
  );
}

const TAB_LABEL: Record<Tab, string> = {
  overview: "Обзор",
  charts: "Графики",
  control: "Управление",
  events: "События",
  diagnostics: "Диагностика",
};

function primaryMetric(d?: DeviceDto): string {
  if (!d) return "";
  if (d.type === "thermo") return "temp";
  if (d.type === "energy" || d.type === "light" || d.type === "fan") return "power";
  if (d.type === "smoke") return "co2";
  return "battery";
}

function Fact({ label, value, accent }: { label: string; value: string; accent?: "warn" | "err" }) {
  return (
    <div className="card">
      <div className="kpi">
        <span className="label">{label}</span>
        <span className="value" style={accent ? { color: `var(--${accent})`, fontSize: 18 } : { fontSize: 18 }}>{value}</span>
      </div>
    </div>
  );
}
