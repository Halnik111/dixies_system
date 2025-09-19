import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function SemiGauge({ value = 0, max = 100, height = 90, currency = "EUR" }) {
    const v = Math.max(0, Math.min(value, max));
    const pct = max > 0 ? v / max : 0;

    const data = [
        { name: "value", val: pct },
        { name: "rest",  val: 1 - pct },
    ];

    const fmt = (n) => new Intl.NumberFormat(undefined, { style: "currency", currency }).format(n);

    return (
        <div style={{ width: "100%", height, position: "relative" }}>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="val"
                        startAngle={180}
                        endAngle={0}
                        innerRadius="70%"
                        outerRadius="100%"
                        stroke="none"
                        isAnimationActive={false}
                    >
                        <Cell key="v" fill="#86E7B7" />
                        <Cell key="r" fill="#2A2F38" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            {/* edge labels */}
            <div style={{ position: "absolute", left: 8, bottom: 28, fontSize: 12, opacity: 0.7 }}>
                {fmt(0)}
            </div>
            <div style={{ position: "absolute", right: 12, bottom: 28, fontSize: 12, opacity: 0.7 }}>
                {fmt(max)}
            </div>
        </div>
    );
}

