// LineChartNivo.jsx
import React, { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";

export default function LineChart({ data, height = 200 }) {
    const safe = Array.isArray(data) ? data : [];

    // X ticks: first / middle / last (indices)
    const xTicks = useMemo(() => {
        if (safe.length === 0) return [];
        const first = 0;
        const middle = Math.floor((safe.length - 1) / 2);
        const last = safe.length - 1;
        return [...new Set([first, middle, last])];
    }, [safe]);

    const maxY = Math.max(0, ...safe.map((d) => d.y));

    // build Nivo series, keep original date on the point for tooltip
    const chartData = [
        {
            id: "sales",
            data: safe.map((d, i) => ({
                x: i,
                y: d.y,
                date: d.x,        // <-- used in tooltip
            })),
        },
    ];

    const formatXTick = (idx) => {
        const entry = safe[idx];
        if (!entry) return "";
        const [Y, M, D] = entry.x.split("-").map(Number);
        return `${M}/${D}`;
    };

    const formatCurrency = (n) =>
        new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "EUR",
        }).format(n);

    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveLine
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 30, left: 50 }}
                xScale={{
                    type: "linear",
                    min: 0,
                    max: safe.length > 0 ? safe.length - 1 : 0,
                }}
                yScale={{ type: "linear", min: 0, max: maxY }}
                curve="monotoneX"
                colors={["#86E7B7"]}
                lineWidth={2}
                enablePoints={true}
                pointSize={5}
                pointColor="#86E7B7"
                pointBorderWidth={0}
                animate={false}
                // 🔥 enable interaction + mesh
                isInteractive={true}
                useMesh={true}
                enableCrosshair={true}

                // custom tooltip showing date + value
                tooltip={({ point }) => {
                    const date = point.data.date;
                    const value = point.data.y;
                    return (
                        <div
                            style={{
                                background: "#111827",
                                color: "#E5E7EB",
                                padding: "6px 8px",
                                fontSize: 12,
                                borderRadius: 4,
                                boxShadow: "0 4px 10px rgba(0,0,0,.4)",
                            }}
                        >
                            <div style={{ opacity: 0.8 }}>{date}</div>
                            <div style={{ fontWeight: 600 }}>
                                {formatCurrency(value)}
                            </div>
                        </div>
                    );
                }}

                axisBottom={{
                    tickValues: xTicks,
                    tickSize: 0,
                    tickPadding: 10,
                    format: (v) => formatXTick(v),
                }}
                axisLeft={{
                    tickSize: 0,
                    tickPadding: 6,
                    format: (v) => `€${v.toFixed(0)}`,
                }}
                enableGridX={false}
                enableGridY={true}
                theme={{
                    axis: {
                        ticks: {
                            text: {
                                fill: "rgba(230,232,236,.7)",
                                fontSize: 11,
                            },
                        },
                        domain: {
                            line: {
                                stroke: "rgba(255,255,255,.15)",
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
                            stroke: "rgba(255,255,255,.3)",
                            strokeWidth: 1,
                            strokeDasharray: "3 3",
                        },
                    },
                }}
                legends={[]}
            />
        </div>
    );
}
