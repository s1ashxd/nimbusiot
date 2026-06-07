import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { SceneDto } from "@nimbus/shared-types";

interface List { items: SceneDto[]; total: number }

export function Automation() {
  const qc = useQueryClient();
  const list = useQuery<List>({ queryKey: ["scenes"], queryFn: () => api.get<List>("/scenes") });
  const toggle = useMutation({
    mutationFn: (id: string) => api.post(`/scenes/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["scenes"] }),
  });
  const run = useMutation({
    mutationFn: (id: string) => api.post(`/scenes/${id}/run`),
  });

  return (
    <div>
      <div className="page-h">
        <div>
          <h1>Сценарии</h1>
          <div className="sub">Автоматизации умного дома</div>
        </div>
      </div>
      <div className="grid cols-3">
        {list.data?.items.map((s) => (
          <div key={s.id} className="scene-card">
            <div className="top">
              <div className="icon" style={{ background: "var(--accent-soft)", color: s.color }}>●</div>
              <span className={`pill ${s.enabled ? "ok" : "offline"}`}>{s.enabled ? "Активен" : "Выкл"}</span>
            </div>
            <div className="name">{s.name}</div>
            <div className="meta">{s.trigger}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button className="btn" onClick={() => toggle.mutate(s.id)}>
                {s.enabled ? "Выключить" : "Включить"}
              </button>
              <button className="btn primary" onClick={() => run.mutate(s.id)}>Запустить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
