// MiniSparklineNivo.jsx
import React, { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";

/** data: [{ x: 'YYYY-MM-DD', y: number }, ...] */
export default function MiniSparkline({
                                              data,
                                              height = 60,
                                              currency = "EUR",
                                          }) {
    const safe = Array.isArray(data) ? data : [];

    const series = useMemo(
        () =>
            safe.map((p, i) => ({
                x: i,
                y: Number(p?.y ?? 0),
                date: p?.x, // keep original date for tooltip
            })),
        [safe]
    );

    const maxY = useMemo(
        () => Math.max(0, ...series.map((p) => p.y)),
        [series]
    );

    const niceCeil = (n) => {
        if (!isFinite(n) || n <= 0) return 1;
        const pow = Math.pow(10, Math.floor(Math.log10(n)));
        const base = n / pow;
        const step = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
        return step * pow;
    };

    const tickCount = 3;
    const step = niceCeil(maxY / tickCount);
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
        +(i * step).toFixed(2)
    );
    const yMax = ticks[ticks.length - 1];

    const fmt = (n) =>
        new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
        }).format(n);

    const chartData = [
        {
            id: "series",
            data: series,
        },
    ];

    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveLine
                data={chartData}
                margin={{ top: 6, right: 6, bottom: 10, left: 40 }}
                xScale={{
                    type: "linear",
                    min: 0,
                    max: series.length ? series.length - 1 : 0,
                }}
                yScale={{ type: "linear", min: 0, max: yMax, stacked: false }}
                curve="monotoneX"
                enableGridX={false}
                enableGridY={true}
                gridYValues={ticks}
                colors={["#86E7B7"]}
                lineWidth={2}

                // we now want points + interaction
                enablePoints={true}
                pointSize={4}
                pointColor="#86E7B7"
                pointBorderWidth={0}
                enableArea={false}
                isInteractive={true}
                animate={false}
                useMesh={true}
                enableCrosshair={true}

                // custom tooltip with date + value
                tooltip={({ point }) => {
                    const date = point.data.date;
                    const value = point.data.y;
                    return (
                        <div
                            style={{
                                background: "#111827",
                                color: "#E5E7EB",
                                padding: "4px 6px",
                                fontSize: 11,
                                borderRadius: 4,
                                boxShadow: "0 4px 10px rgba(0,0,0,.4)",
                            }}
                        >
                            <div style={{ opacity: 0.8 }}>{date}</div>
                            <div style={{ fontWeight: 600 }}>{fmt(value)}</div>
                        </div>
                    );
                }}

                axisBottom={null} // still hide x-axis
                axisLeft={{
                    tickValues: ticks,
                    tickSize: 0,
                    tickPadding: 4,
                    format: (v) => fmt(v),
                }}
                theme={{
                    axis: {
                        ticks: {
                            text: {
                                fontSize: 10,
                                fill: "rgba(230,232,236,.75)",
                            },
                        },
                    },
                    grid: {
                        line: {
                            stroke: "rgba(255,255,255,.08)",
                            strokeDasharray: "3 3",
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
