// pages-misc.jsx — automation, alerts, analytics, map, logs, settings stubs
const { SectionHead: SH2, StatusPill: SP2 } = window.Shell;
const { AreaChart: AC2, BarChart: BC2, Donut: DN2, Sparkline: SPL2 } = window.Charts;

// ─── Automation ────────────────────────────────────────────────────────
const AutomationPage = () => {
  const { SCENES } = window.MOCK;
  const [scenes, setScenes] = useState(SCENES);
  const toggle = (id) => setScenes(scenes.map(s => s.id === id ? { ...s, on: !s.on } : s));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SH2
        title="Сценарии и автоматизация"
        sub="Создавайте правила, реагирующие на события устройств, время или местоположение"
        right={<>
          <button className="btn"><Icon name="download" size={13} /> Шаблоны</button>
          <button className="btn primary"><Icon name="plus" size={13} /> Новый сценарий</button>
        </>}
      />

      {/* Scenes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {scenes.map(s => (
          <div key={s.id} className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="row-flex">
              <div style={{
                width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center",
                background: s.color + "22", color: s.color,
              }}><Icon name={s.icon} size={20} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: "-0.01em" }}>{s.name}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{s.trigger}</div>
              </div>
              <div className={`toggle ${s.on ? "on" : ""}`} onClick={() => toggle(s.id)} />
            </div>

            <div className="row-flex" style={{ gap: 6, fontSize: 12 }}>
              <span className="pill"><Icon name="bolt" size={10} /> {s.actions} действий</span>
              <span className="pill"><Icon name="clock" size={10} /> запущ. {s.id * 3} раз</span>
            </div>

            <div className="row-flex" style={{ gap: 6 }}>
              <button className="btn ghost sm"><Icon name="play" size={11} /> Запустить</button>
              <button className="btn ghost sm"><Icon name="edit" size={11} /> Изменить</button>
              <div className="spacer" />
              <button className="btn ghost sm"><Icon name="more" size={12} /></button>
            </div>
          </div>
        ))}

        {/* Add card */}
        <div className="card" style={{
          padding: 18, display: "grid", placeItems: "center", minHeight: 180,
          border: "1px dashed var(--line-2)", background: "transparent",
        }}>
          <div style={{ textAlign: "center", color: "var(--text-dim)" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: "var(--bg-2)", border: "1px solid var(--line)",
              display: "grid", placeItems: "center", margin: "0 auto 10px",
            }}><Icon name="plus" size={18} /></div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Создать сценарий</div>
            <div style={{ fontSize: 11.5, marginTop: 4 }}>триггер → условия → действия</div>
          </div>
        </div>
      </div>

      {/* Rule builder preview */}
      <div className="card">
        <div className="card-hd">
          <h3>Конструктор правила</h3>
          <span className="sub">«Доброе утро» — ежедневно в 07:00</span>
          <div className="right">
            <button className="btn ghost sm"><Icon name="x" size={12} /> Отменить</button>
            <button className="btn primary sm"><Icon name="check" size={12} /> Сохранить</button>
          </div>
        </div>
        <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <RuleBlock kind="trigger" title="ЕСЛИ" items={[
            { icon: "clock", text: "Время = 07:00", meta: "По будням (Пн–Пт)" },
          ]} />
          <RuleBlock kind="condition" title="И ВЫПОЛНЕНО" items={[
            { icon: "users", text: "Кто-то дома", meta: "Геозона включает любого пользователя" },
            { icon: "sun", text: "Восход солнца наступил", meta: "Москва, +55.75° / +37.62°" },
          ]} />
          <RuleBlock kind="action" title="ТО" items={[
            { icon: "lightbulb", text: "Включить освещение в спальне", meta: "Яркость 40%, плавно за 60 с" },
            { icon: "thermometer", text: "Установить целевую температуру", meta: "Все климат-датчики → 22°C" },
            { icon: "fan", text: "Включить вентиляцию на кухне", meta: "Скорость 2 на 30 минут" },
            { icon: "send", text: "Отправить сводку в Telegram", meta: "Чат «Дом» — погода, новости, календарь" },
          ]} />
        </div>
      </div>
    </div>
  );
};

const RuleBlock = ({ kind, title, items }) => {
  const colors = {
    trigger: { bd: "rgba(0,212,255,0.3)", bg: "rgba(0,212,255,0.05)", text: "var(--accent)" },
    condition: { bd: "rgba(167,139,250,0.3)", bg: "rgba(167,139,250,0.05)", text: "var(--info)" },
    action: { bd: "rgba(34,197,94,0.3)", bg: "rgba(34,197,94,0.05)", text: "var(--ok)" },
  }[kind];
  return (
    <div style={{ borderRadius: 10, border: `1px solid ${colors.bd}`, background: colors.bg, padding: 14 }}>
      <div className="row-flex" style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.12em", color: colors.text }}>{title}</span>
        <div className="spacer" />
        <button className="btn ghost sm"><Icon name="plus" size={11} /> добавить</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it, i) => (
          <div key={i} className="row-flex" style={{
            padding: "10px 12px", background: "var(--bg-1)", border: "1px solid var(--line)",
            borderRadius: 8, gap: 12,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: "var(--bg-3)",
              display: "grid", placeItems: "center", color: colors.text,
            }}><Icon name={it.icon} size={14} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{it.text}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>{it.meta}</div>
            </div>
            <button className="btn ghost sm"><Icon name="edit" size={12} /></button>
            <button className="btn ghost sm"><Icon name="x" size={12} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Alerts ────────────────────────────────────────────────────────────
const AlertsPage = () => {
  const { ALERTS } = window.MOCK;
  const [alerts, setAlerts] = useState(ALERTS);
  const [filter, setFilter] = useState("active");

  const ack = (id) => setAlerts(alerts.map(a => a.id === id ? { ...a, ack: true } : a));

  const filtered = alerts.filter(a => filter === "active" ? !a.ack : filter === "all" ? true : a.level === filter);
  const counts = {
    active: alerts.filter(a => !a.ack).length,
    err: alerts.filter(a => a.level === "err").length,
    warn: alerts.filter(a => a.level === "warn").length,
    info: alerts.filter(a => a.level === "info").length,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SH2 title="Алерты и уведомления" sub={`${counts.active} активных требуют внимания`} right={<>
        <button className="btn"><Icon name="settings" size={13} /> Каналы</button>
        <button className="btn">Отметить все как прочитанные</button>
      </>} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <AlertCount label="Тревога" count={counts.err} tone="err" />
        <AlertCount label="Предупреждение" count={counts.warn} tone="warn" />
        <AlertCount label="Информация" count={counts.info} tone="info" />
        <AlertCount label="Каналы доставки" count="3" tone="" sub="Push, Email, Telegram" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="row-flex" style={{ padding: 12, gap: 8 }}>
          <div className="seg">
            {[["active","Активные"],["all","Все"],["err","Тревоги"],["warn","Предупр."],["info","Инфо"]].map(([k,l]) => (
              <button key={k} className={filter === k ? "active" : ""} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
          <div className="search" style={{ margin: 0, maxWidth: 280 }}>
            <Icon name="search" size={14} />
            <input placeholder="Поиск алертов…" />
          </div>
        </div>

        {filtered.map((a, i) => (
          <div key={a.id} style={{
            display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, padding: "14px 18px",
            borderTop: "1px solid var(--line)", alignItems: "center", opacity: a.ack ? 0.6 : 1,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center",
              background: `var(--${a.level}-soft)`, color: `var(--${a.level})`, position: "relative",
            }}>
              <Icon name={a.level === "err" ? "alerts" : a.level === "warn" ? "alerts" : a.level === "ok" ? "check" : "bell"} size={16} />
              {!a.ack && (a.level === "err" || a.level === "warn") ? (
                <span style={{
                  position: "absolute", inset: -2, borderRadius: 12,
                  border: `2px solid var(--${a.level})`, opacity: 0.4,
                  animation: "pulse 1.6s ease-out infinite",
                }} />
              ) : null}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="row-flex">
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.title}</div>
                <span className={`pill ${a.level}`}>{a.level === "err" ? "тревога" : a.level === "warn" ? "предупреждение" : a.level === "ok" ? "ок" : "инфо"}</span>
                {a.ack ? <span className="pill"><Icon name="check" size={10} /> подтверждено</span> : null}
              </div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{a.desc}</div>
              <div className="row-flex muted" style={{ fontSize: 11.5, marginTop: 6, gap: 12 }}>
                <span className="mono">{a.time}</span>
                <span>·</span>
                <span className="mono">{a.device}</span>
                <span>·</span>
                <span>{a.room}</span>
              </div>
            </div>
            <div className="row-flex">
              {!a.ack ? <button className="btn sm" onClick={() => ack(a.id)}><Icon name="check" size={12} /> Подтвердить</button> : null}
              <button className="btn ghost sm">Открыть устройство</button>
              <button className="btn ghost sm"><Icon name="more" size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AlertCount = ({ label, count, tone, sub }) => (
  <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
    <div className="muted" style={{ fontSize: 12 }}>{label}</div>
    <div className="row-flex" style={{ alignItems: "baseline" }}>
      <span className="mono" style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.02em",
        color: tone ? `var(--${tone})` : "var(--text)" }}>{count}</span>
      {sub ? <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>{sub}</span> : null}
    </div>
  </div>
);

// ─── Analytics ─────────────────────────────────────────────────────────
const AnalyticsPage = () => {
  const { SERIES, makeSeries } = window.MOCK;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SH2 title="Аналитика" sub="Долгосрочные тренды, сравнение комнат, корреляции" right={<>
        <div className="seg">{["7д","30д","90д","год"].map((r,i)=><button key={r} className={i===1?"active":""}>{r}</button>)}</div>
        <button className="btn"><Icon name="download" size={13} /> Отчёт</button>
      </>}/>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <BigKPI label="Энергия" val="284" unit="кВт·ч" delta="−12%" data={SERIES.power} />
        <BigKPI label="Среднее t" val="22.1" unit="°C" delta="±0.3°" data={SERIES.temp} />
        <BigKPI label="Uptime" val="99.7" unit="%" data={SERIES.network} />
        <BigKPI label="Срабатываний" val="412" unit="событий" delta="+24" data={makeSeries(20, 18, 6, 99)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-hd"><h3>Сравнение комнат · температура</h3></div>
          <div className="card-bd">
            <AC2 series={[
              { id: "liv", label: "Гостиная", data: SERIES.temp, color: "#00d4ff" },
              { id: "bed", label: "Спальня", data: makeSeries(48, 20, 0.5, 41), color: "#a78bfa" },
              { id: "kit", label: "Кухня", data: makeSeries(48, 23, 0.7, 53), color: "#fbbf24" },
              { id: "off", label: "Кабинет", data: makeSeries(48, 21.5, 0.4, 67), color: "#22c55e" },
            ]} h={260} />
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><h3>Энергия по дням недели</h3></div>
          <div className="card-bd">
            <BC2 data={[
              { label: "Пн", value: 28 }, { label: "Вт", value: 31 },
              { label: "Ср", value: 26 }, { label: "Чт", value: 29 },
              { label: "Пт", value: 34 }, { label: "Сб", value: 41, color: "#a78bfa" },
              { label: "Вс", value: 38, color: "#a78bfa" },
            ]} h={260} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="card-hd"><h3>Распределение нагрузки</h3></div>
          <div className="card-bd" style={{ display: "flex", justifyContent: "center", padding: 24 }}>
            <DN2 value={62} total={100} size={180} stroke={20} color="var(--accent)" label="62%" sub="средняя загрузка" />
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><h3>Топ потребителей</h3></div>
          <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Бойлер · Ванная", 8.2, "#00d4ff"],
              ["Холодильник", 6.4, "#6ee7ff"],
              ["Освещение", 4.1, "#a78bfa"],
              ["Отопление", 3.8, "#fbbf24"],
              ["Камеры (×3)", 2.1, "#22c55e"],
              ["Прочее", 4.5, "#5b6480"],
            ].map(([l, v, c], i) => (
              <div key={i}>
                <div className="row-flex" style={{ fontSize: 12.5 }}>
                  <span>{l}</span>
                  <div className="spacer" />
                  <span className="mono">{v} кВт·ч</span>
                </div>
                <div style={{ height: 4, background: "var(--bg-3)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(v / 8.2) * 100}%`, background: c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-hd"><h3>Аномалии</h3></div>
          <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { l: "Скачок мощности 4.2 кВт", t: "Сб 21:14 · Гараж", lvl: "warn" },
              { l: "Влажность ниже нормы", t: "Чт ночью · Спальня", lvl: "warn" },
              { l: "Длительная активность", t: "Кухня · 03:00–04:00", lvl: "info" },
              { l: "Пропуски пакетов", t: "Камера двор · 12 ч", lvl: "warn" },
            ].map((a, i) => (
              <div key={i} className="row-flex" style={{
                padding: "10px 12px", background: "var(--bg-2)", borderRadius: 8,
                border: "1px solid var(--line)",
              }}>
                <span className={`pill ${a.lvl}`} style={{ height: 18, padding: "0 6px" }}>
                  <span className="pill-dot" />
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{a.l}</div>
                  <div className="muted" style={{ fontSize: 11 }}>{a.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BigKPI = ({ label, val, unit, delta, data }) => (
  <div className="card" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 6 }}>
    <div className="muted" style={{ fontSize: 12 }}>{label}</div>
    <div className="row-flex" style={{ alignItems: "baseline" }}>
      <span className="mono" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em" }}>{val}</span>
      <span className="muted" style={{ fontSize: 12, marginLeft: 4 }}>{unit}</span>
    </div>
    {delta ? <div style={{ fontSize: 12, color: "var(--ok)" }}>{delta}</div> : null}
    <div style={{ color: "var(--accent)", marginTop: 4 }}><SPL2 data={data} w={200} h={40} /></div>
  </div>
);

// ─── Map ───────────────────────────────────────────────────────────────
const MapPage = ({ onOpenDevice }) => {
  // simple floor plan: rooms + device dots
  const rooms = [
    { id: "liv", name: "Гостиная", x: 40, y: 40, w: 320, h: 200 },
    { id: "kit", name: "Кухня", x: 360, y: 40, w: 200, h: 200 },
    { id: "bed", name: "Спальня", x: 40, y: 240, w: 200, h: 180 },
    { id: "off", name: "Кабинет", x: 240, y: 240, w: 160, h: 180 },
    { id: "bath", name: "Ванная", x: 400, y: 240, w: 160, h: 90 },
    { id: "hall", name: "Прихожая", x: 400, y: 330, w: 160, h: 90 },
  ];
  const dots = [
    { id: "DEV-A1F2", x: 200, y: 80, status: "online", label: "Климат" },
    { id: "DEV-B7C3", x: 460, y: 110, status: "online", label: "Лампа" },
    { id: "DEV-C9D4", x: 480, y: 380, status: "online", label: "Замок" },
    { id: "DEV-J1K4", x: 140, y: 320, status: "online", label: "Климат" },
    { id: "DEV-N5P6", x: 480, y: 280, status: "online", label: "Вент." },
    { id: "DEV-Q7R7", x: 440, y: 305, status: "err", label: "Утечка" },
    { id: "DEV-W4X1", x: 220, y: 350, status: "online", label: "Окно" },
    { id: "DEV-G6B2", x: 470, y: 170, status: "online", label: "Дым" },
    { id: "DEV-F4A1", x: 320, y: 320, status: "online", label: "Движ." },
    { id: "DEV-L3M5", x: 100, y: 180, status: "online", label: "Лампа" },
    { id: "DEV-S9T8", x: 360, y: 320, status: "online", label: "Хаб" },
    { id: "DEV-U2V9", x: 540, y: 380, status: "offline", label: "Камера" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SH2 title="Карта расположения" sub="План квартиры с привязкой устройств" right={<>
        <div className="seg"><button className="active">Этаж 1</button><button>Этаж 2</button><button>Двор</button></div>
        <button className="btn"><Icon name="edit" size={13} /> Редактировать план</button>
      </>}/>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <div className="card" style={{ padding: 24, background: "var(--bg-1)" }}>
          <svg viewBox="0 0 600 460" style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="600" height="460" fill="url(#grid)" />
            {rooms.map(r => (
              <g key={r.id}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="rgba(0,212,255,0.04)"
                  stroke="rgba(0,212,255,0.25)" strokeWidth="1.2" rx="3" />
                <text x={r.x + 10} y={r.y + 22} fill="rgba(255,255,255,0.7)" fontSize="11"
                  fontFamily="var(--font-sans)" fontWeight="500">{r.name}</text>
              </g>
            ))}
            {dots.map(d => {
              const c = d.status === "err" ? "#ef4444" : d.status === "offline" ? "#5b6480" : "#22c55e";
              return (
                <g key={d.id} onClick={() => onOpenDevice && onOpenDevice(d.id)} style={{ cursor: "default" }}>
                  {d.status !== "offline" ? (
                    <circle cx={d.x} cy={d.y} r="14" fill={c} fillOpacity="0.15">
                      <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="fill-opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                  ) : null}
                  <circle cx={d.x} cy={d.y} r="6" fill={c} stroke="#0b0f24" strokeWidth="1.5" />
                  <text x={d.x + 10} y={d.y + 4} fill="rgba(255,255,255,0.85)" fontSize="10"
                    fontFamily="var(--font-mono)">{d.label}</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="card">
          <div className="card-hd"><h3>Легенда</h3></div>
          <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Legend color="#22c55e" label="Онлайн" count="12" />
            <Legend color="#ef4444" label="Тревога" count="1" />
            <Legend color="#5b6480" label="Offline" count="1" />
            <hr className="hr" />
            <div className="muted" style={{ fontSize: 11.5 }}>Кликните по устройству, чтобы открыть его.</div>
            <hr className="hr" />
            <div style={{ fontSize: 12 }}>
              <div className="muted" style={{ fontSize: 11, marginBottom: 6 }}>СОБЫТИЯ НА ПЛАНЕ</div>
              <div className="row-flex" style={{ padding: "8px 0" }}>
                <span className="pill err"><span className="pulse" /> утечка</span>
                <span style={{ fontSize: 12 }}>Ванная · DEV-Q7R7</span>
              </div>
              <div className="row-flex" style={{ padding: "8px 0" }}>
                <span className="pill warn">сигнал</span>
                <span style={{ fontSize: 12 }}>Двор · DEV-D2E5</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Legend = ({ color, label, count }) => (
  <div className="row-flex">
    <span style={{ width: 10, height: 10, borderRadius: 50, background: color }} />
    <span style={{ fontSize: 13 }}>{label}</span>
    <div className="spacer" />
    <span className="mono muted" style={{ fontSize: 12 }}>{count}</span>
  </div>
);

// ─── Logs ──────────────────────────────────────────────────────────────
const LogsPage = () => {
  const { ACTIVITY } = window.MOCK;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SH2 title="Журнал событий" sub="Все системные, пользовательские и сетевые события" right={<>
        <button className="btn"><Icon name="filter" size={13} /> Фильтр</button>
        <button className="btn"><Icon name="download" size={13} /> Экспорт</button>
      </>}/>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 160 }}>Время</th>
              <th style={{ width: 100 }}>Уровень</th>
              <th style={{ width: 110 }}>Источник</th>
              <th>Сообщение</th>
            </tr>
          </thead>
          <tbody>
            {ACTIVITY.concat(ACTIVITY).map((a, i) => (
              <tr key={i}>
                <td className="num muted">2026-05-01 {a.time}</td>
                <td><span className={`pill ${a.level}`}>{a.level}</span></td>
                <td className="muted">{a.scope}</td>
                <td>{a.text}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── Users / Settings ──────────────────────────────────────────────────
const UsersPage = () => {
  const users = [
    { name: "Кирилл Соколов", role: "Администратор", email: "admin@home", color: "#00d4ff", last: "сейчас" },
    { name: "Анна Соколова", role: "Член семьи", email: "anna@home", color: "#a78bfa", last: "5 мин" },
    { name: "Даня Соколов", role: "Член семьи (огр.)", email: "danya@home", color: "#22c55e", last: "1 ч" },
    { name: "Гость · временно", role: "Гость до 12.05", email: "guest-token", color: "#fbbf24", last: "—" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SH2 title="Пользователи и доступ" sub="Управляйте ролями и геозонами" right={<button className="btn primary"><Icon name="plus" size={13} /> Пригласить</button>}/>
      <div className="card" style={{ padding: 0 }}>
        {users.map((u, i) => (
          <div key={i} className="row-flex" style={{ padding: 16, gap: 14, borderTop: i ? "1px solid var(--line)" : "none" }}>
            <div className="avatar" style={{ background: u.color, width: 38, height: 38, fontSize: 12 }}>
              {u.name.split(" ").map(s=>s[0]).slice(0,2).join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{u.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>{u.email}</div>
            </div>
            <span className="pill">{u.role}</span>
            <span className="muted mono" style={{ fontSize: 11.5, width: 80, textAlign: "right" }}>{u.last}</span>
            <button className="btn ghost sm"><Icon name="more" size={12} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPage = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <SH2 title="Настройки системы" sub="Хаб, сеть, безопасность и интеграции" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div className="card">
        <div className="card-hd"><h3>Хаб</h3></div>
        <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="field"><label>Имя хаба</label><input className="input" defaultValue="Главный хаб" /></div>
          <div className="field"><label>Часовой пояс</label>
            <select className="select" defaultValue="MSK"><option>Europe/Moscow (MSK +03:00)</option></select>
          </div>
          <div className="field"><label>Локация</label><input className="input" defaultValue="Москва, +55.75°, +37.62°" /></div>
        </div>
      </div>
      <div className="card">
        <div className="card-hd"><h3>Безопасность</h3></div>
        <div className="card-bd" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["Двухфакторная аутентификация", true],
            ["Шифрование Z-Wave S2", true],
            ["Локальная обработка (без облака)", true],
            ["Резервное копирование", true],
            ["Открытый внешний доступ", false],
          ].map(([l, on], i) => (
            <div key={i} className="row-flex" style={{ justifyContent: "space-between" }}>
              <span style={{ fontSize: 13 }}>{l}</span>
              <div className={`toggle ${on ? "on" : ""}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="card-hd"><h3>Интеграции</h3></div>
        <div className="card-bd" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {[
            ["Apple Home", true, "homekit"],
            ["Google Home", false, "google"],
            ["Telegram бот", true, "send"],
            ["MQTT-брокер", true, "globe"],
            ["Home Assistant", true, "cpu"],
            ["Web-хуки", false, "globe"],
            ["IFTTT", false, "automation"],
            ["Zigbee2MQTT", true, "wifi"],
          ].map(([l, on, ic], i) => (
            <div key={i} style={{
              padding: 14, borderRadius: 10, border: "1px solid var(--line)", background: "var(--bg-2)",
              display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div className="row-flex">
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: "var(--bg-3)",
                  display: "grid", placeItems: "center", color: on ? "var(--accent)" : "var(--text-dim)",
                }}><Icon name={ic} size={15} /></div>
                <div className="spacer" />
                <div className={`toggle ${on ? "on" : ""}`} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{l}</div>
              <div className="muted" style={{ fontSize: 11.5 }}>{on ? "подключено" : "не подключено"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

window.Pages = window.Pages || {};
Object.assign(window.Pages, {
  Automation: AutomationPage,
  Alerts: AlertsPage,
  Analytics: AnalyticsPage,
  Map: MapPage,
  Logs: LogsPage,
  Users: UsersPage,
  Settings: SettingsPage,
});
