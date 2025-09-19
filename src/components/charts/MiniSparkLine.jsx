import React, { useMemo } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    YAxis,
    XAxis,
} from "recharts";

/** data: [{ x: 'YYYY-MM-DD', y: number }, ...] */
export default function MiniSparkline({ data, height = 60, currency = "EUR" }) {
    // compact series
    const d = useMemo(
        () => (data || []).map((p, i) => ({ i, y: Number(p?.y ?? 0) })),
        [data]
    );

    const maxY = useMemo(() => Math.max(0, ...d.map((p) => p.y)), [d]);

    // nice ticks for 3 grid lines
    const niceCeil = (n) => {
        if (!isFinite(n) || n <= 0) return 1;
        const pow = Math.pow(10, Math.floor(Math.log10(n)));
        const base = n / pow;
        const step = base <= 1 ? 1 : base <= 2 ? 2 : base <= 5 ? 5 : 10;
        return step * pow;
    };
    const tickCount = 3;
    const step = niceCeil(maxY / tickCount);
    const ticks = Array.from({ length: tickCount + 1 }, (_, i) => +(i * step).toFixed(2));
    const yMax = ticks[ticks.length - 1];

    const fmt = (n) =>
        new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);

    // draw labels slightly BELOW each grid line, INSIDE the plot
    const YInsideTick = ({ y, payload }) => (
        <text
            x={6}                 // fixed left padding inside chart
            y={y + 10}            // just below the grid line
            fill="rgba(230,232,236,.55)"
            fontSize="10"
            textAnchor="start"
        >
            {fmt(payload.value)}
        </text>
    );

    return (
        <div style={{ width: "100%", height }}>
            <ResponsiveContainer>
                <LineChart data={d} margin={{ top: 6, right: 6, bottom: 10, left: 6 }}>
                    {/* subtle horizontal grid */}
                    <CartesianGrid
                        horizontal
                        vertical={false}
                        stroke="rgba(255,255,255,.08)"
                        strokeDasharray="3 3"
                    />
                    <XAxis dataKey="i" hide />
                    {/* IMPORTANT: give the axis a tiny width and mirror it so labels render inside (not clipped) */}
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        mirror
                        width={24}
                        ticks={ticks}
                        domain={[0, yMax]}
                        tick={<YInsideTick />}
                    />
                    <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#86E7B7"
                        strokeWidth={2}
                        dot={false}
                        activeDot={false}         // <- no stray dot
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
