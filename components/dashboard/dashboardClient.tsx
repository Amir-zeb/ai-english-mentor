"use client";

import { useState, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, Legend, CartesianGrid,
} from "recharts";
import { DashboardStats, PeriodBucket } from "@/lib/stats/getDashboardStats";

type RangeT = "weekly" | "monthly";

export default function DashboardClient({ stats }: { stats: DashboardStats }) {
    const [activeMentorName, setActiveMentorName] = useState(stats.mentors[0]?.mentorName);
    const [range, setRange] = useState<RangeT>("weekly");

    const activeMentor = stats.mentors.find((m) => m.mentorName === activeMentorName);
    const buckets: PeriodBucket[] = activeMentor ? activeMentor[range] : [];

    const chartData = buckets.map((b) => ({
        label: b.label,
        Bad: b.scoreBands.red,
        Average: b.scoreBands.yellow,
        Good: b.scoreBands.green,
        avgScore: b.avgScore,
        suggestionsUsed: b.suggestionsUsed,
    }));

    const summary = useMemo(() => {
        const totalMessages = buckets.reduce((s, b) => s + b.totalMessages, 0);
        const suggestionsUsed = buckets.reduce((s, b) => s + b.suggestionsUsed, 0);
        const scored = buckets.filter((b) => b.avgScore !== null);
        const avgScore = scored.length
            ? Math.round(scored.reduce((s, b) => s + (b.avgScore as number), 0) / scored.length)
            : null;
        return { totalMessages, suggestionsUsed, avgScore };
    }, [buckets]);

    if (!stats.mentors.length) {
        return <p className="p-6 text-white/60">No mentors configured yet.</p>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                    {stats.mentors.map((m) => (
                        <button
                            key={m.mentorName}
                            onClick={() => setActiveMentorName(m.mentorName)}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                                m.mentorName === activeMentorName
                                    ? "bg-white/10 text-white"
                                    : "text-white/50 hover:text-white"
                            }`}
                        >
                            {m.mentorTitle}
                        </button>
                    ))}
                </div>
                <div className="flex gap-1 rounded-lg border border-white/10 p-1">
                    {(["weekly", "monthly"] as RangeT[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`rounded-md px-3 py-1.5 text-sm capitalize transition ${
                                range === r ? "bg-white/10 text-white" : "text-white/50 hover:text-white"
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatCard label="Average score" value={summary.avgScore !== null ? `${summary.avgScore}` : "—"} />
                <StatCard label="Messages practiced" value={summary.totalMessages.toString()} />
                <StatCard label="Suggestions used" value={summary.suggestionsUsed.toString()} />
            </div>

            <ChartCard title="Message quality over time">
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }} />
                        <Legend />
                        <Bar dataKey="Bad" stackId="a" fill="#ef4444" />
                        <Bar dataKey="Average" stackId="a" fill="#eab308" />
                        <Bar dataKey="Good" stackId="a" fill="#22c55e" />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Average score trend">
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                        <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.4)" fontSize={12} />
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }} />
                        <Line type="monotone" dataKey="avgScore" stroke="#60a5fa" strokeWidth={2} connectNulls dot />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Suggestions used">
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="label" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
                        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)" }} />
                        <Bar dataKey="suggestionsUsed" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>
        </div>
    );
}

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/10 p-4">
            <p className="text-xs text-white/50">{label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>
    );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/10 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white/70">{title}</h3>
            {children}
        </div>
    );
}