// components/charts/LineChart.js
import React, { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";

export default function LineChart({ data, height = 260 }) {
    // 1) Normalize input: either [{x,y},...] or [{id,data:[...]}]
    const series = useMemo(() => {
        if (!Array.isArray(data)) return [];

        // single-series: [{ x, y }, ...]
        if (data.length > 0 && !data[0].data) {
            return [
                {
                    id: "Revenue",
                    role: "revenue",
                    data: data.map((p) => ({
                        x: p.x,
                        y: p.y,
                        originalY: p.y,
                    })),
                },
            ];
        }

        // multi-series: [{ id, data: [...] }, ...]
        return data.map((s, idx) => ({
            id: s.id || (idx === 0 ? "Revenue" : "Orders"),
            role: idx === 0 ? "revenue" : "orders",
            data: (s.data || []).map((p) => ({
                x: p.x,
                y: p.y,
                originalY: p.y,
            })),
        }));
    }, [data]);

    const allPoints = series.flatMap((s) => s.data);
    const hasEnough = allPoints.length >= 2;

    // 2) Compute axis ranges (revenue & orders)
    const revenueSeries = series.find((s) => s.role === "revenue");
    const ordersSeries = series.find((s) => s.role === "orders");

    const revenueMax = revenueSeries
        ? Math.max(...revenueSeries.data.map((p) => p.originalY), 0)
        : 0;
    const ordersMax = ordersSeries
        ? Math.max(...ordersSeries.data.map((p) => p.originalY), 0)
        : 0;

    const safeRevenueMax = revenueMax <= 0 ? 1 : revenueMax;
    const safeOrdersMax = ordersMax <= 0 ? 1 : ordersMax;

    // 3) Build plotted series
    // Revenue: plotted as-is
    // Orders: scaled to revenue Y range
    const plottedSeries = useMemo(() => {
        if (!series.length) return [];

        if (!ordersSeries || !revenueSeries) {
            // only one series, just use it directly
            return series.map((s) => ({
                ...s,
                data: s.data.map((p) => ({
                    ...p,
                    y: p.originalY,
                })),
            }));
        }

        const rev = {
            id: "Revenue",
            role: "revenue",
            data: revenueSeries.data.map((p) => ({
                ...p,
                y: p.originalY,
            })),
        };

        const ord = {
            id: "Orders",
            role: "orders",
            data: ordersSeries.data.map((p) => ({
                ...p,
                // scale orders to same vertical range as revenue
                y: (p.originalY / safeOrdersMax) * safeRevenueMax,
            })),
        };

        return [rev, ord];
    }, [series, revenueSeries, ordersSeries, safeRevenueMax, safeOrdersMax]);

    // 4) X ticks — show more dates, but not *all* when long
    const base = plottedSeries[0]?.data || [];
    const n = base.length;

    const xTicks = useMemo(() => {
        if (n === 0) return [];

        // For short ranges, show all dates
        if (n <= 7) {
            return base.map((p) => p.x);
        }

        // For mid ranges, show about every 2nd / 3rd point
        const desiredTicks = 7; // target number of tick labels
        const step = Math.max(1, Math.floor(n / desiredTicks));

        const ticks = [];
        for (let i = 0; i < n; i += step) {
            ticks.push(base[i].x);
        }
        // ensure last date is included
        const lastX = base[n - 1].x;
        if (ticks[ticks.length - 1] !== lastX) {
            ticks.push(lastX);
        }

        return ticks;
    }, [base, n]);

    // 5) Y max for chart (revenue space)
    const maxY = safeRevenueMax;

    const prettyDate = (v) => {
        if (typeof v !== "string") return v;
        const parts = v.split("-");
        if (parts.length !== 3) return v;
        const [Y, M, D] = parts;
        return `${M}/${D}`;
    };

    const fmtEUR = (n) =>
        new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "EUR",
        }).format(n);

    // Build right-axis ticks for orders (0..ordersMax), mapped into revenue space
    const orderTickValues = useMemo(() => {
        if (!ordersSeries) return [];
        if (ordersMax === 0) return [0];

        const ticks = [];
        const desiredSteps = 4;
        const rawStep = Math.max(1, Math.ceil(ordersMax / desiredSteps));

        for (let v = 0; v <= ordersMax; v += rawStep) {
            ticks.push(v);
        }
        if (ticks[ticks.length - 1] !== ordersMax) ticks.push(ordersMax);

        return ticks;
    }, [ordersSeries, ordersMax]);

    const axisRightConfig = ordersSeries
        ? {
            tickSize: 0,
            tickPadding: 6,
            legendOffset: 50,
            legendPosition: "middle",
            tickValues: orderTickValues.map(
                (ov) => (ov / safeOrdersMax) * safeRevenueMax
            ),
            format: (v) => {
                if (safeRevenueMax === 0) return 0;
                const orderVal = Math.round(
                    (v / safeRevenueMax) * safeOrdersMax
                );
                return orderVal;
            },
        }
        : null;

    // 6) Slice tooltip: show both series at same X
    const sliceTooltip = ({ slice }) => {
        if (!slice.points || slice.points.length === 0) return null;

        const date = slice.points[0].data.x;
        const rows = slice.points.map((p) => {
            const serieId = p.seriesId;
            const original =
                p.data.originalY !== undefined ? p.data.originalY : p.data.y;

            return {
                id: serieId,
                role:
                    serieId === "Orders"
                        ? "orders"
                        : "revenue",
                value: original,
            };
        });

        return (
            <div
                style={{
                    background: "#111827",
                    color: "#E5E7EB",
                    padding: "8px 12px",
                    borderRadius: 4,
                    boxShadow: "0 4px 12px rgba(0,0,0,.4)",
                    fontSize: 12,
                }}
            >
                <div style={{ opacity: 0.7, marginBottom: 6 }}>{date}</div>

                {rows.map((r) => (
                    <div key={r.id}>
                        {r.role === "revenue" ? fmtEUR(r.value) : r.value}
                    </div>
                ))}
            </div>
        );
    };

    // 7) After hooks: handle not-enough-data state
    if (!hasEnough) {
        return (
            <div
                style={{
                    width: "100%",
                    height,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.6,
                    fontSize: 12,
                }}
            >
                Not enough data
            </div>
        );
    }

    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveLine
                data={plottedSeries}
                margin={{ top: 20, right: 25, bottom: 40, left: 60 }}
                xScale={{ type: "point" }}
                yScale={{ type: "linear", min: 0, max: maxY }}
                curve="monotoneX"
                enablePoints={true}
                pointSize={5}
                enableSlices="x"
                sliceTooltip={sliceTooltip}
                enableCrosshair={true}
                useMesh={true}
                animate={false}
                motionConfig="stiff"
                colors={(serie) =>
                    serie.id === "Orders" ? "#aa4141" : "#86E7B7"
                }
                seriesStyle={(serie) => ({
                    strokeDasharray: serie.id === "Orders" ? "6 6" : "0",
                })}
                axisBottom={{
                    tickValues: xTicks,
                    tickSize: 0,
                    tickPadding: 10,
                    format: prettyDate,
                }}
                axisLeft={{
                    tickSize: 0,
                    tickPadding: 6,
                    legendOffset: -50,
                    legendPosition: "middle",
                    format: (v) => fmtEUR(v),
                }}
                axisRight={axisRightConfig}
                enableGridX={false}
                enableGridY={true}
                theme={{
                    axis: {
                        ticks: {
                            text: {
                                fill: "rgba(230,232,236,.7)",
                                fontSize: 10,
                            },
                        },
                        legend: {
                            text: {
                                fill: "rgba(230,232,236,.85)",
                                fontSize: 10,
                            },
                        },
                    },
                    grid: {
                        line: {
                            stroke: "rgba(255,255,255,.1)",
                        },
                    },
                    crosshair: {
                        line: {
                            stroke: "rgba(255,255,255,.4)",
                            strokeWidth: 1,
                            strokeDasharray: "4 4",
                        },
                    },
                }}
            />
        </div>
    );
}
