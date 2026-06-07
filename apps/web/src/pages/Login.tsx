import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function Login() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@nimbus.local");
  const [password, setPassword] = useState("Passw0rd!");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      nav("/");
    } catch (e) {
      setErr("Не удалось войти. Проверьте данные.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <h1>Nimbus IoT</h1>
        <div className="sub">Войдите для управления устройствами</div>
        <label htmlFor="email">Email</label>
        <input id="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Пароль</label>
        <input id="password" autoComplete="current-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <div className="err">{err}</div>}
        <button type="submit" disabled={busy}>{busy ? "…" : "Войти"}</button>
        <div className="login-hint">
          Демо: admin@nimbus.local / Passw0rd!
        </div>
      </form>
    </div>
  );
}
