// Dashboard.js
import "./Dashboard.css";
import React, {useEffect, useMemo, useState} from "react";
import { useOrders } from "../context/OrdersContext";
import MiniSparkline from "../components/charts/MiniSparkLine";
import SemiGauge from "../components/charts/SemiGauge";


/* ---------- date helpers ---------- */
const startOfToday = () => {
    const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
const startOfWeek = (d = new Date()) => {
    // Monday as first day (change to 0 for Sunday if you prefer)
    const day = d.getDay(); // 0..6, Sun..Sat
    const mondayOffset = (day + 6) % 7; // 0 => Mon
    const t = startOfToday();
    t.setDate(t.getDate() - mondayOffset);
    return t;
};
const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
const startOfYear  = (d = new Date()) => new Date(d.getFullYear(), 0, 1);

const RANGE_LABELS = {
    today: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
};

/* ---------- range selector UI ---------- */
const RangeSelector = ({ value, onChange, busy }) => {
    const [open, setOpen] = useState(false);
    const toggle = () => setOpen(o => !o);
    const choose = (val) => { onChange(val); setOpen(false); };

    return (
        <div className="ds-range">
            <button className="ds-range-btn" onClick={toggle} aria-expanded={open} aria-haspopup="menu">
                {RANGE_LABELS[value] || "This Month"}
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="currentColor" d="M7 10l5 5 5-5z" />
                </svg>
                {busy && <span className="ds-range-kbd">loading…</span>}
            </button>

            {open && (
                <div className="ds-range-menu" role="menu">
                    {["today","week","month","year"].map(k => (
                        <button
                            key={k}
                            className="ds-range-item"
                            onClick={() => choose(k)}
                            role="menuitem"
                        >
                            {RANGE_LABELS[k]} {k === value ? "✓" : ""}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const normDate = (v) => {
    if (!v) return null;
    if (typeof v === "string" || typeof v === "number") return new Date(v);
    if (v.$date) {
        const raw = typeof v.$date === "object" && v.$date.$numberLong ? v.$date.$numberLong : v.$date;
        return new Date(Number(raw));
    }
    if (v.$numberLong) return new Date(Number(v.$numberLong));
    try { return new Date(v); } catch { return null; }
};

const getPriceNum = (p) => {
    if (p == null) return 0;
    if (typeof p === "number") return p;
    if (typeof p === "string") return Number(p) || 0;
    if (typeof p === "object") {
        return Number(p.$numberInt || p.$numberDouble || p.$numberDecimal || 0);
    }
    return 0;
};

const ymd = (d) => {
    const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0"), da = String(d.getDate()).padStart(2,"0");
    return `${y}-${m}-${da}`;
};

/** returns [{x:'YYYY-MM-DD', total, count, aov}] from orders in the selected range */
const buildDailyAgg = (orders, since) => {
    const map = new Map();
    for (const o of (orders || [])) {
        // normalize createdAt you already use elsewhere
        const raw = o.createdAt?.$date?.$numberLong || o.createdAt?.$date || o.createdAt;
        const dt = new Date(typeof raw === "string" ? raw : Number(raw));
        if (!dt || isNaN(dt)) continue;
        const key = ymd(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()));
        const prev = map.get(key) || { total: 0, count: 0 };
        map.set(key, { total: prev.total + getPriceNum(o.price), count: prev.count + 1 });
    }
    // ensure continuity from 'since' to today
    const today = new Date(); today.setHours(0,0,0,0);
    const cur = new Date(since.getFullYear(), since.getMonth(), since.getDate());
    const out = [];
    while (cur <= today) {
        const key = ymd(cur);
        const { total = 0, count = 0 } = map.get(key) || {};
        out.push({ x: key, total: +total.toFixed(2), count, aov: count ? +(total / count).toFixed(2) : 0 });
        cur.setDate(cur.getDate() + 1);
    }
    return out;
};

const niceCeil = (n) => {
    if (!isFinite(n) || n <= 0) return 10;
    const pow = Math.pow(10, Math.floor(Math.log10(n)));
    const base = n / pow;
    const step = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
    return step * pow;
};


/* Build daily series from orders in [since..today] */
const buildDailySeries = (orders, since) => {
    const map = new Map();
    for (const o of (orders || [])) {
        const dt = normDate(o.createdAt);
        if (!dt) continue;
        const key = ymd(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()));
        map.set(key, (map.get(key) || 0) + getPriceNum(o.price));
    }
    const today = startOfToday();
    const series = [];
    const cur = new Date(since.getFullYear(), since.getMonth(), since.getDate());
    while (cur <= today) {
        const key = ymd(cur);
        series.push({ x: key, y: Number((map.get(key) || 0).toFixed(2)) });
        cur.setDate(cur.getDate() + 1);
    }
    return series;
};

/* ----- Minimal SVG Line Chart (no libs) ----- */
const LineChart = ({ data, height = 200, padding = { l: 32, r: 8, t: 12, b: 24 } }) => {
    const w = 600; // virtual width (SVG viewBox); responsive via CSS
    const h = height;
    const vb = `0 0 ${w} ${h}`;
    const n = data.length;
    const maxY = Math.max(0, ...data.map(d => d.y));
    const minY = 0;
    const ix = (i) => {
        if (n <= 1) return padding.l;
        return padding.l + (i * (w - padding.l - padding.r)) / (n - 1);
    };
    const iy = (v) => {
        const rng = (maxY - minY) || 1;
        const t = (v - minY) / rng;
        return padding.t + (h - padding.t - padding.b) * (1 - t);
    };

    const path = data.map((d,i) => `${i===0?"M":"L"} ${ix(i)} ${iy(d.y)}`).join(" ");
    const ticksX = [0, Math.floor((n-1)/2), Math.max(0,n-1)].filter((v,i,a)=>a.indexOf(v)===i);
    const tickLabel = (i) => {
        const s = data[i]?.x || "";
        // show as M/D
        const [Y,M,D] = s.split("-").map(Number);
        return `${M}/${D}`;
    };
    const yTickVals = [minY, maxY];

    return (
        <div className="chart-wrap">
            <svg className="chart-svg" viewBox={vb} preserveAspectRatio="none" aria-label="Sales line chart">
                {/* axes */}
                <line className="chart-axis" x1={padding.l} y1={h - padding.b} x2={w - padding.r} y2={h - padding.b}/>
                <line className="chart-axis" x1={padding.l} y1={padding.t} x2={padding.l} y2={h - padding.b}/>

                {/* grid & y ticks */}
                {yTickVals.map((v,idx)=>(
                    <g key={idx}>
                        <line className="chart-grid" x1={padding.l} y1={iy(v)} x2={w - padding.r} y2={iy(v)}/>
                        <text x={padding.l - 6} y={iy(v)} fill="rgba(230,232,236,.7)" fontSize="10" textAnchor="end" dominantBaseline="middle">
                            €{v.toFixed(0)}
                        </text>
                    </g>
                ))}

                {/* x ticks */}
                {ticksX.map((ti,idx)=>(
                    <g key={idx}>
                        <line className="chart-grid" x1={ix(ti)} y1={h - padding.b} x2={ix(ti)} y2={h - padding.b + 4}/>
                        <text x={ix(ti)} y={h - padding.b + 14} fill="rgba(230,232,236,.7)" fontSize="10" textAnchor="middle">
                            {tickLabel(ti)}
                        </text>
                    </g>
                ))}

                {/* series */}
                <path className="chart-line" d={path}/>
                {data.map((d,i)=>(
                    <circle key={i} className="chart-dot" cx={ix(i)} cy={iy(d.y)} r="2"/>
                ))}
            </svg>
        </div>
    );
};

export default function Dashboard() {
    const { orders, isLoading, error, refresh } = useOrders();
    const [range, setRange] = useState("month"); // default UI: This Month

    // Load when range changes
    useEffect(() => {
        const now = new Date();
        const since =
            range === "today" ? startOfToday() :
                range === "week"  ? startOfWeek(now) :
                    range === "month" ? startOfMonth(now) :
                        startOfYear(now);

        // request server-side filtered data
        refresh({ since, limit: 5000 });
    }, [range]);

    // KPI: total sales for current orders array
    const totalSales = useMemo(() => {
        const sum = (orders || []).reduce((acc, o) => acc + getPriceNum(o.price), 0);
        return Number(sum.toFixed(2));
    }, [orders]);

    // Build daily series for the chart
    const sinceForSeries = useMemo(() => {
        const now = new Date();
        return range === "today" ? startOfToday() :
            range === "week"  ? startOfWeek(now) :
                range === "month" ? startOfMonth(now) :
                    startOfYear(now);
    }, [range]);

    // Average Spend (AOV) calculations
    const ordersCount = (orders || []).length;
    const avgSpend = ordersCount ? +(totalSales / ordersCount).toFixed(2) : 0;

    const dailyAgg = useMemo(() => buildDailyAgg(orders, sinceForSeries), [orders, sinceForSeries]);
    const aovSeries = useMemo(() => dailyAgg.map(d => ({ x: d.x, y: d.aov })), [dailyAgg]);

    // pick a pleasant gauge max (slightly above peak AOV)
    //const peakAOV = Math.max(0, ...aovSeries.map(d => d.y), avgSpend);
    const peakAOV = 15; // fixed target for now
    const gaugeMax = niceCeil(peakAOV * 1.2);
    
    // derive a minimal UI list here; your charts can use the same 'orders'
    const list = useMemo(() => orders ?? [], [orders]);

    const series = useMemo(() => buildDailySeries(orders, sinceForSeries), [orders, sinceForSeries]);

    const fmtEUR = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(n);


    return (
        <div className="dashboard">
            {/* Header row with title and range selector */}
            <div className="dashboard-header">
                <RangeSelector value={range} onChange={setRange} busy={isLoading}/>
                <h2 className="dashboard-title">ORDER SYSTEM</h2>
            </div>

            {/* Cards */}
            <div className="cards-grid">
                {/* Total Sales card */}
                <section className="card">
                    <div className="card-header">
                        <h3 className="card-title">Total Sales — {RANGE_LABELS[range]}</h3>
                        {isLoading && <span className="kpi-subtle">Loading…</span>}
                    </div>
                    {error && <div className="kpi-subtle" style={{color: "#ff6b6b"}}>{error}</div>}
                    <div className="kpi-value">{fmtEUR(totalSales)}</div>
                    <div className="kpi-subtle">{series.length} day{series.length === 1 ? "" : "s"} in range</div>
                </section>

                {/* Line chart card */}
                <section className="card">
                    <div className="card-header">
                        <h3 className="card-title">Sales by Day</h3>
                        {isLoading && <span className="kpi-subtle">Loading…</span>}
                    </div>
                    <LineChart data={series} height={200}/>
                </section>
                {/* Average Spend card */}
                <section className="card">
                    <div className="card-header">
                        <h3 className="card-title">Average Spend</h3>
                    </div>

                    <div className="avg-card">
                        {/* left: interactive sparkline of daily AOV */}
                        <MiniSparkline data={aovSeries}/>

                        {/* right: big number + gauge with €0 and €target labels */}
                        <div className="avg-right">
                            <div className="avg-number">
                                {new Intl.NumberFormat(undefined, {
                                    style: "currency",
                                    currency: "EUR"
                                }).format(avgSpend)}
                            </div>
                            <SemiGauge value={avgSpend} max={gaugeMax}/>
                        </div>
                    </div>
                </section>

                {/* Example card showing the filtered orders; your other cards/graphs can use the same 'orders' */}
                <section className="card">
                    <div className="card-header">
                        <h3 className="card-title">Orders — {RANGE_LABELS[range]}</h3>
                        {isLoading && <span className="card-subtle">Loading…</span>}
                    </div>

                    {error && <div className="card-subtle" style={{color: "#ff6b6b"}}>{error}</div>}

                    <div className="orders-list">
                        {list.map((o) => {
                            const id = o._id?.$oid || o._id;
                            const tsRaw = o.createdAt?.$date?.$numberLong || o.createdAt?.$date || o.createdAt;
                            const ts = normDate(tsRaw);
                            const eur = o.price?.$numberInt ? Number(o.price.$numberInt) : Number(o.price ?? 0);

                            return (
                                <div key={id} className="order-row">
                                    <div className="order-left">
                                        <div className="order-id">#{String(id).slice(-6)}</div>
                                        <div className="order-ts">{ts ? ts.toLocaleString() : "—"}</div>
                                    </div>
                                    <div className="order-right">
                                        <div className="order-amount">€{eur.toFixed(2)}</div>
                                        <div className="order-meta">
                                            {Array.isArray(o.mealIDs) ? `${o.mealIDs.length} item${o.mealIDs.length !== 1 ? "s" : ""}` : ""}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {!isLoading && !list.length && (
                            <div className="card-subtle">No orders for {RANGE_LABELS[range].toLowerCase()}.</div>
                        )}
                    </div>
                </section>
            </div>
            {/* Add more .card sections below; they will reflect the same filtered 'orders' */}
        </div>
    );
}

