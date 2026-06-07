import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { ActivityDto } from "@nimbus/shared-types";

interface List { items: ActivityDto[]; total: number; page: number; size: number }

export function Activity() {
  const [level, setLevel] = useState("");
  const [scope, setScope] = useState("");
  const params = new URLSearchParams();
  if (level) params.set("level", level);
  if (scope) params.set("scope", scope);

  const q = useQuery<List>({
    queryKey: ["activity", level, scope],
    queryFn: () => api.get<List>(`/activity?${params}&size=200`),
    refetchInterval: 10000,
  });

  return (
    <div>
      <div className="page-h">
        <div>
          <h1>Журнал</h1>
          <div className="sub">{q.data?.total ?? 0} событий</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle}>
            <option value="">Уровень</option>
            <option>info</option>
            <option>ok</option>
            <option>warn</option>
            <option>err</option>
          </select>
          <select value={scope} onChange={(e) => setScope(e.target.value)} style={selectStyle}>
            <option value="">Категория</option>
            <option>system</option>
            <option>device</option>
            <option>network</option>
            <option>user</option>
            <option>automation</option>
          </select>
        </div>
      </div>
      <div className="card">
        {q.data?.items.map((a) => (
          <div key={a.id} className="activity-row">
            <div className="ts">{new Date(a.ts).toLocaleString("ru-RU")}</div>
            <div><span className={`pill ${a.level}`}>{a.level}</span></div>
            <div className="scope">{a.scope}</div>
            <div>{a.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const selectStyle: React.CSSProperties = { height: 36, padding: "0 12px", background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, color: "var(--text)" };
