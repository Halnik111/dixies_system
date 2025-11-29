import React from "react";
import { ResponsivePie } from "@nivo/pie";

/**
 * value    = current average (for selected range)
 * baseline = total average of all time (centre of gauge)
 */
export default function SemiGauge({
                                      value,
                                      baseline,
                                      height = 90,
                                      currency = "EUR",
                                  }) {
    // baseline is required conceptually; if it's 0 or invalid, just avoid crash
    const base =
        typeof baseline === "number" && isFinite(baseline) && baseline !== 0
            ? baseline
            : 1;

    const safeValue =
        typeof value === "number" && isFinite(value) ? value : 0;

    // -20% / +20% range around baseline
    const min = base * 0.5;
    const max = base * 1.5;

    // linear mapping: min → 0, base → 0.5, max → 1
    let frac = (safeValue - min) / (max - min);
    // clamp to [0, 1]
    frac = Math.max(0, Math.min(1, frac));

    // values for Nivo pie must be > 0
    const valueSlice = Math.max(frac, 0.0001);
    const restSlice = Math.max(1 - frac, 0.0001);

    // IMPORTANT: "rest" first (right side), "value" second (left side)
    const data = [
        { id: "rest", value: restSlice },
        { id: "value", value: valueSlice },
    ];

    const fmt = (n) =>
        new Intl.NumberFormat(undefined, {
            style: "currency",
            currency,
        }).format(n);

    const diffPct = base !== 0 ? ((safeValue - base) / base) * 100 : 0;

    return (
        <div style={{ width: "100%", height, position: "relative" }}>
            <ResponsivePie
                data={data}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                startAngle={90}   // bottom semi-circle
                endAngle={-90}
                innerRadius={0.7}
                padAngle={0}
                cornerRadius={0}
                enableArcLabels={false}
                enableArcLinkLabels={false}
                // 🔥 color by id so "value" is always green
                colors={(d) =>
                    d.id === "value" ? "#86E7B7" : "#2A2F38"
                }
                sortByValue={false}
                animate={false}
                tooltip={() => (
                    <div
                        style={{
                            background: "#111827",
                            color: "#E5E7EB",
                            padding: "6px 8px",
                            fontSize: 11,
                            borderRadius: 4,
                            boxShadow: "0 4px 10px rgba(0,0,0,.4)",
                        }}
                    >
                        <div>
                            Current: <strong>{fmt(safeValue)}</strong>
                        </div>
                        <div>Baseline (all time): {fmt(base)}</div>
                        <div>
                            Diff:{" "}
                            
                        </div>
                    </div>
                )}
            />

            {/* left / right labels: -20% / +20% of baseline */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    fontSize: 10,
                    opacity: 0.7,
                }}
            >
                {fmt(min)}
            </div>
            <div
                style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    fontSize: 10,
                    opacity: 0.7,
                }}
            >
                {fmt(max)}
            </div>

            {/* centre baseline label */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 8,
                    transform: "translateX(-50%)",
                    fontSize: 10,
                    opacity: 0.6,
                }}
            >
                <div
                    style={{
                        fontSize: 14,
                        color:
                            diffPct >= 0
                                ? "#6EE7B7"
                                : "#F97373",
                    }}
                >
                    {diffPct >= 0 ? "+" : ""}
                    {diffPct.toFixed(1)}%
                </div>
                avg: {fmt(base)}
            </div>
        </div>
    );
}
