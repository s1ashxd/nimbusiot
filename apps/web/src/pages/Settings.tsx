import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface SettingsResp {
  hub: { id: string; name: string; status: string; fw: string; lastSeenAt: string } | null;
  flags: { autoUpdates: boolean; twoFactor: boolean; telemetryRetentionDays: number };
}

interface IntegrationItem { kind: string; enabled: boolean; updatedAt: string }

export function Settings() {
  const s = useQuery<SettingsResp>({ queryKey: ["settings"], queryFn: () => api.get<SettingsResp>("/settings") });
  const ig = useQuery<IntegrationItem[]>({ queryKey: ["integrations"], queryFn: () => api.get<IntegrationItem[]>("/integrations") });

  return (
    <div>
      <div className="page-h">
        <div>
          <h1>Настройки</h1>
          <div className="sub">Хаб и интеграции</div>
        </div>
      </div>
      <div className="grid cols-2">
        <div className="card">
          <div className="card-h"><h3>Хаб</h3></div>
          {s.data?.hub ? (
            <div className="grid cols-2">
              <div><div className="sub">Имя</div><div>{s.data.hub.name}</div></div>
              <div><div className="sub">ID</div><div>{s.data.hub.id}</div></div>
              <div><div className="sub">Статус</div><div>{s.data.hub.status}</div></div>
              <div><div className="sub">Прошивка</div><div>{s.data.hub.fw}</div></div>
              <div><div className="sub">Последняя активность</div><div>{new Date(s.data.hub.lastSeenAt).toLocaleString("ru-RU")}</div></div>
            </div>
          ) : <div className="sub">Хаб не зарегистрирован</div>}
        </div>
        <div className="card">
          <div className="card-h"><h3>Флаги</h3></div>
          <div className="activity-row"><div>Автообновления</div><div /><div /><div>{s.data?.flags.autoUpdates ? "Вкл" : "Выкл"}</div></div>
          <div className="activity-row"><div>Двухфакторная</div><div /><div /><div>{s.data?.flags.twoFactor ? "Вкл" : "Выкл"}</div></div>
          <div className="activity-row"><div>Хранение телеметрии</div><div /><div /><div>{s.data?.flags.telemetryRetentionDays} дней</div></div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-h"><h3>Интеграции</h3></div>
        <table className="table">
          <thead><tr><th>Тип</th><th>Статус</th><th>Обновлено</th></tr></thead>
          <tbody>
            {ig.data?.map((i) => (
              <tr key={i.kind}>
                <td data-label="Тип">{i.kind}</td>
                <td data-label="Статус"><span className={`pill ${i.enabled ? "ok" : "offline"}`}>{i.enabled ? "Активна" : "Не активна"}</span></td>
                <td data-label="Обновлено" className="sub">{new Date(i.updatedAt).toLocaleString("ru-RU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
