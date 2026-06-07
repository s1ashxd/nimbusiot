import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { AlertDto, AlertStatus } from "@nimbus/shared-types";
import { LevelPill } from "../components/StatusPill";

interface List { items: AlertDto[]; total: number }

export function Alerts() {
  const [tab, setTab] = useState<AlertStatus>("firing");
  const qc = useQueryClient();
  const list = useQuery<List>({
    queryKey: ["alerts", tab],
    queryFn: () => api.get<List>(`/alerts?status=${tab}`),
    refetchInterval: 10000,
  });

  const ack = useMutation({
    mutationFn: (id: string) => api.post(`/alerts/${id}/ack`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });
  const resolve = useMutation({
    mutationFn: (id: string) => api.post(`/alerts/${id}/resolve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }),
  });

  return (
    <div>
      <div className="page-h">
        <div>
          <h1>Тревоги</h1>
          <div className="sub">{list.data?.total ?? 0} записей</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["firing","ack","resolved"] as AlertStatus[]).map((t) => (
            <button key={t} className="btn" style={tab === t ? { borderColor: "var(--accent)", color: "var(--accent)" } : {}} onClick={() => setTab(t)}>
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>Уровень</th><th>Заголовок</th><th>Устройство</th><th>Открыта</th><th>Действия</th></tr></thead>
          <tbody>
            {list.data?.items.map((a) => (
              <tr key={a.id}>
                <td data-label="Уровень"><LevelPill level={a.level} /></td>
                <td data-label="Заголовок"><strong>{a.title}</strong><div className="sub">{a.description}</div></td>
                <td data-label="Устройство" className="sub">{a.device?.name ?? "—"}</td>
                <td data-label="Открыта" className="sub">{new Date(a.startedAt).toLocaleString("ru-RU")}</td>
                <td data-label="Действия">
                  {a.status === "firing" && (
                    <>
                      <button className="btn" onClick={() => ack.mutate(a.id)}>Принять</button>{" "}
                      <button className="btn primary" onClick={() => resolve.mutate(a.id)}>Закрыть</button>
                    </>
                  )}
                  {a.status === "ack" && (
                    <button className="btn primary" onClick={() => resolve.mutate(a.id)}>Закрыть</button>
                  )}
                  {a.status === "resolved" && <span className="sub">—</span>}
                </td>
              </tr>
            ))}
            {!list.data?.items.length && !list.isLoading && (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 32, color: "var(--text-dim)" }}>Нет тревог в этой вкладке</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const TAB_LABEL: Record<AlertStatus, string> = {
  firing: "Активные",
  ack: "Принятые",
  resolved: "Закрытые",
};
