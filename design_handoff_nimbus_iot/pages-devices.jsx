// pages-devices.jsx — devices list and detail
const { SectionHead: SH, StatusPill: SP } = window.Shell;
const { Sparkline: SPL, AreaChart: AC, SignalBars: SB, BatteryIndicator: BI, Donut: DN } = window.Charts;

const DevicesPage = ({ onOpenDevice }) => {
  const { DEVICES, TYPES_META, ROOMS } = window.MOCK;
  const [view, setView] = useState("table");
  const [filter, setFilter] = useState("all");
  const [room, setRoom] = useState("all");
  const [selected, setSelected] = useState(new Set());

  const filtered = DEVICES.filter(d => {
    if (filter !== "all" && d.status !== filter) return false;
    if (room !== "all" && d.room !== room) return false;
    return true;
  });

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SH
        title="Устройства"
        sub={`${DEVICES.length} устройств · ${DEVICES.filter(d => d.status === 'online').length} онлайн · ${DEVICES.filter(d => d.status === 'warn').length} предупр. · ${DEVICES.filter(d => d.status === 'offline').length} offline`}
        right={
          <>
            <div className="seg">
              <button className={view === "table" ? "active" : ""} onClick={() => setView("table")}>Таблица</button>
              <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}>Сетка</button>
            </div>
            <button className="btn"><Icon name="download" size={13} /> CSV</button>
            <button className="btn primary"><Icon name="plus" size={13} /> Добавить</button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: "flex", gap: 8, padding: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div className="search" style={{ margin: 0, maxWidth: 320 }}>
            <Icon name="search" size={14} />
            <input placeholder="Поиск по ID, имени, типу…" />
          </div>
          <div className="seg">
            {[["all","Все"],["online","Онлайн"],["warn","Предупр."],["err","Тревога"],["offline","Offline"]].map(([k,l]) => (
              <button key={k} className={filter === k ? "active" : ""} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <select className="select" value={room} onChange={e => setRoom(e.target.value)} style={{ height: 30, fontSize: 12 }}>
            <option value="all">Все комнаты</option>
            {ROOMS.map(r => <option key={r}>{r}</option>)}
          </select>
          <div className="spacer" />
          {selected.size > 0 ? (
            <>
              <span className="muted" style={{ fontSize: 12 }}>Выбрано: {selected.size}</span>
              <button className="btn sm">Перезагрузить</button>
              <button className="btn sm">Обновить FW</button>
              <button className="btn sm" style={{ color: "var(--err)" }}><Icon name="trash" size={12} /> Удалить</button>
            </>
          ) : (
            <button className="btn ghost sm"><Icon name="filter" size={12} /> Фильтры</button>
          )}
        </div>

        {view === "table" ? (
          <div style={{ overflow: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 32 }}><input type="checkbox" /></th>
                  <th>Устройство</th>
                  <th>Тип</th>
                  <th>Комната</th>
                  <th>Статус</th>
                  <th>Значение</th>
                  <th>Сигнал</th>
                  <th>Батарея</th>
                  <th>Тренд</th>
                  <th>Видно</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const meta = TYPES_META[d.type] || {};
                  const trendData = window.MOCK.makeSeries(20, 50, 6, parseInt(d.id.replace(/\D/g,'').slice(0,3) || "1"));
                  return (
                    <tr key={d.id} className={selected.has(d.id) ? "selected" : ""} onClick={() => onOpenDevice && onOpenDevice(d.id)} style={{ cursor: "default" }}>
                      <td onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selected.has(d.id)} onChange={() => toggle(d.id)} />
                      </td>
                      <td>
                        <div className="row-flex">
                          <div style={{
                            width: 28, height: 28, borderRadius: 7, display: "grid", placeItems: "center",
                            background: "var(--bg-3)", color: "var(--text-dim)",
                          }}><Icon name={meta.icon || "cpu"} size={14} /></div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div>
                            <div className="muted mono" style={{ fontSize: 11 }}>{d.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{meta.label}</td>
                      <td>{d.room}</td>
                      <td><SP status={d.status} /></td>
                      <td className="num">{d.value}{d.unit ? <span className="muted"> {d.unit}</span> : null}</td>
                      <td><span style={{ color: d.signal < 3 ? "var(--warn)" : "var(--text-dim)" }}><SB level={d.signal} /></span></td>
                      <td>{d.battery != null ? <BI pct={d.battery} /> : <span className="muted">—</span>}</td>
                      <td><span style={{ color: d.status === "err" ? "var(--err)" : d.status === "warn" ? "var(--warn)" : "var(--accent)" }}>
                        <SPL data={trendData} w={70} h={20} />
                      </span></td>
                      <td className="muted mono" style={{ fontSize: 11 }}>{d.lastSeen}</td>
                      <td onClick={e => e.stopPropagation()}><button className="icon-btn"><Icon name="more" size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, padding: 12 }}>
            {filtered.map(d => (
              <window.Pages.DeviceMiniCard key={d.id} d={d} onOpen={() => onOpenDevice && onOpenDevice(d.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────
const DeviceDetailPage = ({ deviceId, onBack }) => {
  const { DEVICES, TYPES_META, makeSeries } = window.MOCK;
  const d = DEVICES.find(x => x.id === deviceId) || DEVICES[0];
  const meta = TYPES_META[d.type] || {};

  const [tab, setTab] = useState("overview");
  const [auto, setAuto] = useState(true);
  const [target, setTarget] = useState(22);
  const [bright, setBright] = useState(78);
  const [reporting, setReporting] = useState(60);

  const tempSeries = useMemo(() => makeSeries(48, 22, 0.6, 99), []);
  const humSeries = useMemo(() => makeSeries(48, 47, 2, 41), []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div className="card">
        <div className="card-bd" style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <button className="icon-btn" onClick={onBack}><Icon name="chevron-right" size={16} style={{ transform: "rotate(180deg)" }} /></button>
          <div style={{
            width: 56, height: 56, borderRadius: 12, display: "grid", placeItems: "center",
            background: "var(--accent-soft)", color: "var(--accent)",
          }}><Icon name={meta.icon || "cpu"} size={26} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row-flex" style={{ gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>{d.name}</h2>
              <SP status={d.status} big />
            </div>
            <div className="muted row-flex" style={{ marginTop: 6, fontSize: 12.5, gap: 14 }}>
              <span className="mono">{d.id}</span>
              <span>·</span>
              <span>{meta.label}</span>
              <span>·</span>
              <span>{d.room}</span>
              <span>·</span>
              <span className="mono">FW {d.fw}</span>
              <span>·</span>
              <span>посл. отчёт {d.lastSeen}</span>
            </div>
          </div>
          <div className="row-flex">
            <button className="btn"><Icon name="refresh" size={13} /> Опросить</button>
            <button className="btn"><Icon name="edit" size={13} /> Переименовать</button>
            <button className="btn"><Icon name="download" size={13} /> История</button>
            <button className="btn primary"><Icon name="bolt" size={13} /> Действие</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "0 16px", borderTop: "1px solid var(--line)" }}>
          {[["overview","Обзор"],["settings","Настройки"],["automation","Правила"],["history","История"],["diagnostics","Диагностика"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              background: "transparent", border: 0, padding: "12px 14px", fontSize: 13, fontWeight: 500,
              color: tab === k ? "var(--text)" : "var(--text-dim)",
              borderBottom: `2px solid ${tab === k ? "var(--accent)" : "transparent"}`,
            }}>{l}</button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <BigStat label="Температура" value="22.4" unit="°C" delta="+0.3°" data={tempSeries} color="#00d4ff" />
            <BigStat label="Влажность" value="47.8" unit="%" delta="−1.2%" deltaDir="down" data={humSeries} color="#6ee7ff" />
            <BigStat label="Давление" value="755" unit="мм рт.ст." data={makeSeries(20, 755, 0.4, 71)} color="#a78bfa" />
            <BigStat label="Качество (CO₂)" value="612" unit="ppm" delta="норма" tone="ok" data={makeSeries(20, 612, 18, 17)} color="#22c55e" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 16 }}>
            <div className="card">
              <div className="card-hd">
                <h3>Температура · 24 часа</h3>
                <div className="right">
                  <div className="seg">
                    {["1ч","24ч","7д","30д"].map((r, i) => (
                      <button key={r} className={i === 1 ? "active" : ""}>{r}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="card-bd">
                <AC series={[
                  { id: "t", label: "°C", data: tempSeries, color: "#00d4ff" },
                  { id: "tg", label: "уставка", data: Array(48).fill(target), color: "#fbbf24" },
                ]} h={260} />
              </div>
            </div>

            <div className="card">
              <div className="card-hd"><h3>Управление</h3></div>
              <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <Control label="Автоматический режим" sub="Климат-контроль по сценарию">
                  <div className={`toggle ${auto ? "on" : ""}`} onClick={() => setAuto(!auto)} />
                </Control>
                <Control label="Целевая температура" right={<span className="mono" style={{ fontSize: 14 }}>{target}°C</span>}>
                  <input className="slider" type="range" min="16" max="28" step="0.5"
                    value={target} onChange={e => setTarget(+e.target.value)}
                    style={{ width: "100%" }} />
                </Control>
                <Control label="Период опроса" right={<span className="mono" style={{ fontSize: 14 }}>{reporting} с</span>}>
                  <input className="slider" type="range" min="10" max="300" step="10"
                    value={reporting} onChange={e => setReporting(+e.target.value)}
                    style={{ width: "100%" }} />
                </Control>
                <hr className="hr" />
                <Control label="LED-индикатор" sub="Светодиод на корпусе"><div className="toggle on" /></Control>
                <Control label="Звуковые оповещения"><div className="toggle" /></Control>
                <Control label="Защита паролем"><div className="toggle on" /></Control>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div className="card">
              <div className="card-hd"><h3>Связь</h3></div>
              <div className="card-bd" style={{ display: "grid", gap: 10 }}>
                <KV label="Протокол" v="Z-Wave 700" />
                <KV label="RSSI" v="-58 дБм" tone="ok" sub="хорошо" />
                <KV label="Маршрут" v="Хаб → DEV-A1F2" mono />
                <KV label="Ретрансляции" v="0" mono />
                <KV label="Последний обмен" v="0.4 с назад" mono />
              </div>
            </div>
            <div className="card">
              <div className="card-hd"><h3>Питание</h3></div>
              <div className="card-bd" style={{ display: "flex", gap: 16, alignItems: "center" }}>
                <DN value={86} total={100} size={100} stroke={9}
                  color="var(--ok)" label="86%" sub="батарея" />
                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
                  <KV label="Тип" v="CR2032 ×2" />
                  <KV label="Расход" v="~ 3% / нед" />
                  <KV label="Замена" v="через ~6 нед" />
                  <KV label="Ист. зарядов" v="3" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-hd"><h3>События устройства</h3></div>
              <div className="card-bd" style={{ padding: 0 }}>
                {[
                  { t: "11:42", l: "ok", txt: "Отчёт принят: 22.4°C / 47.8%" },
                  { t: "11:40", l: "ok", txt: "Отчёт принят: 22.3°C / 47.9%" },
                  { t: "11:30", l: "info", txt: "Уставка изменена: 21 → 22°C" },
                  { t: "10:55", l: "ok", txt: "Сценарий «Доброе утро» применён" },
                  { t: "07:00", l: "ok", txt: "Калибровка завершена" },
                ].map((e, i) => (
                  <div key={i} className="row-flex" style={{
                    padding: "10px 14px", borderTop: i ? "1px solid var(--line)" : "none", gap: 10,
                  }}>
                    <span className="mono muted" style={{ fontSize: 11, width: 38 }}>{e.t}</span>
                    <span className={`pill ${e.l}`} style={{ height: 16, fontSize: 10, padding: "0 6px" }}>
                      <span className="pill-dot" />
                    </span>
                    <span style={{ fontSize: 12.5 }}>{e.txt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "settings" && <SettingsTab />}
      {tab === "automation" && <AutomationTabForDevice />}
      {tab === "history" && <HistoryTab tempSeries={tempSeries} humSeries={humSeries} />}
      {tab === "diagnostics" && <DiagnosticsTab />}
    </div>
  );
};

const Control = ({ label, sub, right, children }) => (
  <div>
    <div className="row-flex" style={{ justifyContent: "space-between", marginBottom: sub ? 2 : 6 }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {sub ? <div className="muted" style={{ fontSize: 11.5 }}>{sub}</div> : null}
      </div>
      {right}
      {!right && typeof children === "object" && children?.props?.className?.includes("toggle") ? children : null}
    </div>
    {!(typeof children === "object" && children?.props?.className?.includes("toggle")) ? children : null}
  </div>
);

const KV = ({ label, v, mono, tone, sub }) => (
  <div className="row-flex" style={{ justifyContent: "space-between", fontSize: 12.5 }}>
    <span className="muted">{label}</span>
    <span className={mono ? "mono" : ""} style={{ color: tone === "ok" ? "var(--ok)" : "var(--text)" }}>
      {v} {sub ? <span className="muted" style={{ fontSize: 11 }}>· {sub}</span> : null}
    </span>
  </div>
);

const BigStat = ({ label, value, unit, delta, deltaDir = "up", tone, data, color }) => (
  <div className="card" style={{ padding: 16 }}>
    <div className="muted" style={{ fontSize: 11.5, fontWeight: 500 }}>{label}</div>
    <div className="row-flex" style={{ alignItems: "baseline", gap: 4, marginTop: 6 }}>
      <span className="mono" style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>{value}</span>
      <span className="muted" style={{ fontSize: 12 }}>{unit}</span>
      <div className="spacer" />
      <span style={{ color, opacity: 0.9 }}><SPL data={data} w={70} h={24} /></span>
    </div>
    {delta ? (
      <div style={{
        marginTop: 6, fontSize: 12,
        color: tone === "ok" ? "var(--ok)" : deltaDir === "down" ? "var(--ok)" : "var(--text-dim)",
      }}>{delta}</div>
    ) : null}
  </div>
);

const SettingsTab = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
    <div className="card">
      <div className="card-hd"><h3>Основные параметры</h3></div>
      <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="field"><label>Имя устройства</label><input className="input" defaultValue="Климат-датчик · Гостиная" /></div>
        <div className="field"><label>Комната</label>
          <select className="select" defaultValue="Гостиная">
            {window.MOCK.ROOMS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="field"><label>Описание</label>
          <textarea className="input" rows="3" style={{ height: "auto", padding: 8 }} defaultValue="Основной датчик микроклимата на стене у окна" />
        </div>
        <div className="field"><label>Метки</label>
          <div className="row-flex" style={{ flexWrap: "wrap" }}>
            {["климат","главная","sleeping-area","основной"].map(t => (
              <span key={t} className="pill"><span className="pill-dot" />{t}</span>
            ))}
            <button className="btn ghost sm"><Icon name="plus" size={11} /> метка</button>
          </div>
        </div>
      </div>
    </div>

    <div className="card">
      <div className="card-hd"><h3>Калибровка и пороги</h3></div>
      <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="field"><label>Поправка температуры</label>
          <div className="row-flex"><input className="input" defaultValue="-0.4" style={{ width: 100 }} /><span className="muted">°C</span></div>
        </div>
        <div className="field"><label>Поправка влажности</label>
          <div className="row-flex"><input className="input" defaultValue="+1.2" style={{ width: 100 }} /><span className="muted">%</span></div>
        </div>
        <hr className="hr" />
        <div className="field"><label>Порог тревоги — слишком жарко</label>
          <div className="row-flex"><input className="input" defaultValue="28" style={{ width: 100 }} /><span className="muted">°C</span></div>
        </div>
        <div className="field"><label>Порог тревоги — слишком холодно</label>
          <div className="row-flex"><input className="input" defaultValue="16" style={{ width: 100 }} /><span className="muted">°C</span></div>
        </div>
        <div className="field"><label>Порог влажности (низкий / высокий)</label>
          <div className="row-flex"><input className="input" defaultValue="30" style={{ width: 80 }} />
            <span className="muted">—</span>
            <input className="input" defaultValue="65" style={{ width: 80 }} />
            <span className="muted">%</span>
          </div>
        </div>
      </div>
    </div>

    <div className="card" style={{ gridColumn: "1 / -1" }}>
      <div className="card-hd">
        <h3>Опасная зона</h3>
        <span className="sub">действия необратимы</span>
      </div>
      <div className="card-bd" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button className="btn">Перезагрузить устройство</button>
        <button className="btn">Сбросить калибровку</button>
        <button className="btn">Очистить историю</button>
        <button className="btn" style={{ color: "var(--err)", borderColor: "rgba(239,68,68,0.3)" }}>
          <Icon name="trash" size={13} /> Удалить из системы
        </button>
      </div>
    </div>
  </div>
);

const AutomationTabForDevice = () => {
  const rules = [
    { name: "Включить кондиционер", trigger: "Если t > 25°C в Гостиной", actions: 2, enabled: true },
    { name: "Уведомить о низкой влажности", trigger: "Если влажность < 30%", actions: 1, enabled: true },
    { name: "Открыть шторы", trigger: "Если CO₂ > 800 ppm и время 8:00–22:00", actions: 1, enabled: false },
  ];
  return (
    <div className="card">
      <div className="card-hd">
        <h3>Правила, использующие это устройство</h3>
        <div className="right"><button className="btn primary sm"><Icon name="plus" size={12} /> Новое правило</button></div>
      </div>
      <div className="card-bd" style={{ padding: 0 }}>
        {rules.map((r, i) => (
          <div key={i} className="row-flex" style={{
            padding: "14px 16px", borderTop: i ? "1px solid var(--line)" : "none", gap: 14,
          }}>
            <div className={`toggle ${r.enabled ? "on" : ""}`} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.name}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{r.trigger} → {r.actions} действий</div>
            </div>
            <button className="btn ghost sm"><Icon name="edit" size={12} /></button>
            <button className="btn ghost sm"><Icon name="more" size={12} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const HistoryTab = ({ tempSeries, humSeries }) => (
  <div className="card">
    <div className="card-hd">
      <h3>История измерений</h3>
      <div className="right">
        <div className="seg">{["24ч","7д","30д","год"].map((r,i)=><button key={r} className={i===1?"active":""}>{r}</button>)}</div>
        <button className="btn"><Icon name="download" size={13} /> CSV</button>
      </div>
    </div>
    <div className="card-bd">
      <AC series={[
        { id: "t", label: "Температура", data: tempSeries, color: "#00d4ff" },
        { id: "h", label: "Влажность %", data: humSeries.map(v => v / 2), color: "#a78bfa" },
      ]} h={300} />
    </div>
  </div>
);

const DiagnosticsTab = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
    <div className="card">
      <div className="card-hd"><h3>Диагностика</h3>
        <div className="right"><button className="btn sm">Запустить тест</button></div>
      </div>
      <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          ["Связь с хабом", "ok", "12 мс, RSSI -58 дБм"],
          ["Целостность данных", "ok", "CRC ok, 0 ошибок за 24ч"],
          ["Калибровка датчика", "ok", "± 0.2°C"],
          ["Версия прошивки", "ok", "2.4.1 — актуальная"],
          ["Состояние батареи", "warn", "86% — норма; следующая замена через 6 нед"],
          ["Безопасность", "ok", "Шифрование S2 включено"],
        ].map(([l, st, d], i) => (
          <div key={i} className="row-flex" style={{
            padding: "10px 12px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)",
          }}>
            <Icon name={st === "ok" ? "check" : "alerts"} size={14}
              style={{ color: st === "ok" ? "var(--ok)" : "var(--warn)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{l}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>{d}</div>
            </div>
            <span className={`pill ${st}`}>{st === "ok" ? "OK" : "WARN"}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="card">
      <div className="card-hd"><h3>Лог устройства</h3>
        <div className="right"><button className="btn ghost sm">Очистить</button></div>
      </div>
      <div className="card-bd" style={{ padding: 0, fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.65 }}>
        <div style={{ padding: 14, background: "#05071a", maxHeight: 380, overflow: "auto" }}>
          {[
            ["11:42:18.412", "INFO", "report_received temp=22.4 hum=47.8"],
            ["11:42:18.080", "DBG ", "tx_packet seq=4128 size=24"],
            ["11:40:15.102", "INFO", "report_received temp=22.3 hum=47.9"],
            ["11:30:01.000", "INFO", "config_update target_temp=22.0"],
            ["11:00:00.022", "INFO", "checksum_ok crc=0xA41F"],
            ["10:55:12.548", "INFO", "scene_apply id=1 (morning)"],
            ["10:00:00.000", "DBG ", "heartbeat ok rssi=-58"],
            ["07:00:00.000", "INFO", "calibration_ok offset=-0.4"],
            ["00:00:00.512", "INFO", "boot_ok fw=2.4.1"],
          ].map(([t,l,m], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 50px 1fr", gap: 10 }}>
              <span style={{ color: "var(--text-faint)" }}>{t}</span>
              <span style={{ color: l === "INFO" ? "var(--accent)" : l === "DBG " ? "var(--text-dim)" : "var(--warn)" }}>{l}</span>
              <span style={{ color: "var(--text)" }}>{m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

window.Pages = window.Pages || {};
window.Pages.Devices = DevicesPage;
window.Pages.DeviceDetail = DeviceDetailPage;
