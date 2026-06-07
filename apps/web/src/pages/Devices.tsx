import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { DeviceDto } from "@nimbus/shared-types";
import { StatusPill } from "../components/StatusPill";

interface DevicesList { items: DeviceDto[]; total: number; page: number; size: number }

export function Devices() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");

  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (q) params.set("q", q);

  const list = useQuery<DevicesList>({
    queryKey: ["devices", status, q],
    queryFn: () => api.get<DevicesList>(`/devices?${params}`),
    refetchInterval: 15000,
  });

  return (
    <div>
      <div className="page-h">
        <div>
          <h1>Устройства</h1>
          <div className="sub">{list.data?.total ?? 0} устройств</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Поиск…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ height: 36, padding: "0 12px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, color: "var(--text)" }}
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ height: 36, padding: "0 12px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, color: "var(--text)" }}
          >
            <option value="">Все статусы</option>
            <option value="online">Онлайн</option>
            <option value="warn">Внимание</option>
            <option value="err">Ошибка</option>
            <option value="offline">Офлайн</option>
          </select>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Тип</th>
              <th>Комната</th>
              <th>Статус</th>
              <th>Значение</th>
              <th>Заряд</th>
              <th>Сигнал</th>
              <th>FW</th>
            </tr>
          </thead>
          <tbody>
            {list.data?.items.map((d) => (
              <tr key={d.id}>
                <td data-label="Имя"><Link to={`/devices/${d.id}`}>{d.name}</Link></td>
                <td data-label="Тип" className="sub">{d.type}</td>
                <td data-label="Комната" className="sub">{d.room.name}</td>
                <td data-label="Статус"><StatusPill status={d.status} /></td>
                <td data-label="Значение">{d.valueText} {d.unit}</td>
                <td data-label="Заряд">{d.battery !== null ? `${d.battery}%` : "—"}</td>
                <td data-label="Сигнал">{d.signal}/5</td>
                <td data-label="FW" className="sub">{d.fw}</td>
              </tr>
            ))}
            {list.isError && (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--err)", padding: 32 }}>Ошибка загрузки списка устройств</td></tr>
            )}
            {!list.data?.items.length && !list.isLoading && !list.isError && (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text-dim)", padding: 32 }}>Устройства не найдены</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
