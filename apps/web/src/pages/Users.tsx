import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { UserDto } from "@nimbus/shared-types";

interface List { items: UserDto[]; total: number }

export function Users() {
  const q = useQuery<List>({
    queryKey: ["users"],
    queryFn: () => api.get<List>("/users"),
  });
  return (
    <div>
      <div className="page-h">
        <div>
          <h1>Пользователи</h1>
          <div className="sub">{q.data?.total ?? 0}</div>
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead><tr><th>ФИО</th><th>Email</th><th>Роли</th><th>Создан</th></tr></thead>
          <tbody>
            {q.data?.items.map((u) => (
              <tr key={u.id}>
                <td data-label="ФИО">{u.fullName}</td>
                <td data-label="Email" className="sub">{u.email}</td>
                <td data-label="Роли">{u.roles.map((r) => <span key={r} className={`pill info`} style={{ marginRight: 4 }}>{r}</span>)}</td>
                <td data-label="Создан" className="sub">{new Date(u.createdAt).toLocaleDateString("ru-RU")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
