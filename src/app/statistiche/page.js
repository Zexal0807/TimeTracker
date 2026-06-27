"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { formatCurrency, formatDuration } from "@/lib/format"
import { AlertCircle, CheckCircle2, Clock, Euro } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

function rangeBounds(range, from, to) {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    let start = null;
    if (range === "7d") {
        start = new Date(now);
        start.setDate(start.getDate() - 6);
        start.setHours(0, 0, 0, 0);
    } else if (range === "30d") {
        start = new Date(now);
        start.setDate(start.getDate() - 29);
        start.setHours(0, 0, 0, 0);
    } else if (range === "month") {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === "year") {
        start = new Date(now.getFullYear(), 0, 1);
    } else if (range === "all") {
        start = null;
    } else if (range === "custom") {
        start = from ? new Date(from) : null;
        if (start) start.setHours(0, 0, 0, 0);
        if (to) {
            const t = new Date(to);
            t.setHours(23, 59, 59, 999);
            return { start, end: t };
        }
    }
    return { start, end };
}

function toInputDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export default function StatisticsPage() {

    const [tasks, setTasks] = useState([])
    const [projects, setProjects] = useState([])
    const [clients, setClients] = useState([])

    useEffect(() => {
        const fetchClients = async () => {
            const response = await fetch(`/api/clients`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`)
            }

            const data = await response.json();
            setClients(data);
        }
        fetchClients();
        const fetchTasks = async () => {
            const response = await fetch(`/api/tasks`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`)
            }

            const data = await response.json();
            setTasks(data);
        }
        fetchTasks();
        const fetchProjects = async () => {
            const response = await fetch(`/api/projects`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`)
            }

            const data = await response.json();
            setProjects(data);
        }
        fetchProjects();
    }, [])

    const [range, setRange] = useState("30d");
    const [from, setFrom] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        return toInputDate(d);
    });

    const [to, setTo] = useState(() => {
        const d = new Date();
        return toInputDate(d);
    });
    const [idClient, setIdClient] = useState("all");
    const [idProject, setIdProject] = useState("all");

    const filteredProjects = useMemo(
        () => idClient == "all"
            ? projects
            : projects.filter((p) => p.idClient == idClient),
        [projects, idClient]
    );
    const filtered = useMemo(() => {
        const { start, end } = rangeBounds(range, from, to);
        return tasks.filter((e) => {
            const s = new Date(e.startDateTime);
            if (start && s < start)
                return false;
            if (s > end)
                return false;
            if (idClient !== "all" && e.project?.idClient !== idClient)
                return false;
            if (idProject !== "all" && e.idProject !== idProject)
                return false;
            return true;
        });
    }, [tasks, range, from, to, idClient, idProject]);

    const totals = useMemo(() => {
        let seconds = 0;
        let earnings = 0;
        let paid = 0;
        let unpaid = 0;
        for (const e of filtered) {
            const d = new Date(e.endDateTime) / 1000 - new Date(e.startDateTime) / 1000 ?? 0;
            const amount = (d / 3600) * Number(e.project.hourlyRate ?? 0);
            seconds += d;
            earnings += amount;
            if (e.paid)
                paid += amount;
            else
                unpaid += amount;
        }
        return {
            seconds,
            earnings,
            paid,
            unpaid,
            count: filtered.length
        };
    }, [filtered]);

    const byDay = useMemo(() => {
        const dayMs = 24 * 60 * 60 * 1000;
        const { start, end } = rangeBounds(range, from, to);

        if (!end)
            return {
                data: [],
                projects: []
            };

        const endDate = new Date(end);
        endDate.setHours(0, 0, 0, 0);

        let startDate;
        if (start) {
            startDate = new Date(start);
        } else if (filtered.length > 0) {
            startDate = new Date(
                Math.min(...filtered.map((e) => new Date(e.startDateTime).getTime())));
        } else {
            startDate = new Date(endDate);
        }
        startDate.setHours(0, 0, 0, 0);

        const toDayKey = (value) => {
            const d = new Date(value);
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${day}/${m}`;
        };

        const projectsMap = new Map();

        for (const e of filtered) {
            const projectKey = `project_${e.idProject}`;
            if (!projectsMap.has(projectKey)) {
                projectsMap.set(projectKey, {
                    key: projectKey,
                    idProject: e.idProject,
                    name: `${e.project?.client?.name ?? "—"} · ${e.project?.name ?? "—"}`,
                    color: e.project?.color ?? "#3b82f6",
                });
            }
        }

        const daysCount = Math.floor((endDate.getTime() - startDate.getTime()) / dayMs) + 1;

        const rows = Array.from({ length: daysCount }, (_, i) => {
            const current = new Date(startDate.getTime() + i * dayMs);
            const dayKey = toDayKey(current);

            const row = {
                dayKey,
                date: dayKey,
                total: 0,
            };

            for (const p of projectsMap.values()) {
                row[p.key] = 0;
            }

            return row;
        });

        const rowMap = new Map(rows.map((row) => [row.dayKey, row]));

        for (const e of filtered) {
            const dayKey = toDayKey(e.startDateTime);
            const projectKey = `project_${e.idProject}`;
            const row = rowMap.get(dayKey);

            if (!row) continue;

            const seconds = (new Date(e.endDateTime).getTime() - new Date(e.startDateTime).getTime()) / 1000;

            const hours = +(Math.max(0, seconds) / 3600).toFixed(2);

            row[projectKey] = +((row[projectKey] ?? 0) + hours).toFixed(2);
            row.total = +(row.total + hours).toFixed(2);
        }

        return {
            data: rows,
            projects: Array.from(projectsMap.values()),
        };
    }, [filtered, range, from, to]);

    const byProject = useMemo(() => {
        const map = new Map();
        for (const e of filtered) {
            const key = e.idProject;
            const cur = map.get(key) ?? {
                name: `${e.project?.client?.name ?? "—"} · ${e.project?.name ?? "—"}`,
                seconds: 0,
                amount: 0,
                total: 0,
                color: e.project?.color ?? "#3b82f6",
            };
            let s = new Date(e.endDateTime) / 1000 - new Date(e.startDateTime) / 1000 ?? 0;
            cur.seconds += s
            cur.amount += e.paid ? (s / 3600) * Number(e.project.hourlyRate ?? 0) : 0;
            cur.total += (s / 3600) * Number(e.project.hourlyRate ?? 0);
            map.set(key, cur);
        }
        return Array.from(map.values()).sort((a, b) => b.seconds - a.seconds);
    }, [filtered]);

    return (
        <>
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Statistiche</h1>
                    <p className="text-muted-foreground mt-1">
                        Analizza le statistiche delle task
                    </p>
                </div>
            </header>

            {/* Filtri */}
            <Card className="p-4 mt-4 grid gap-3 grid-cols-3">
                <div>
                    <Label>Periodo</Label>
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Ultimi 7 giorni</SelectItem>
                            <SelectItem value="30d">Ultimi 30 giorni</SelectItem>
                            <SelectItem value="month">Mese corrente</SelectItem>
                            <SelectItem value="year">Anno corrente</SelectItem>
                            <SelectItem value="all">Tutto</SelectItem>
                            <SelectItem value="custom">Personalizzato</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Cliente</Label>
                    <Select
                        value={idClient}
                        onValueChange={(v) => {
                            setIdClient(v);
                            setIdProject("all");
                        }}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tutti i clienti</SelectItem>
                            {clients.map((c) => (
                                <SelectItem key={c.idClient} value={c.idClient}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Progetto</Label>
                    <Select
                        value={idProject}
                        onValueChange={(v) => setIdProject(v)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tutti i progetti</SelectItem>
                            {filteredProjects.map((p) => (
                                <SelectItem key={p.idProject} value={p.idProject}>
                                    {p.name} ({formatCurrency(p.hourlyRate)})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {range === "custom" && (
                    <>
                        <div>
                            <Label>Da</Label>
                            <Input
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>A</Label>
                            <Input
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                            />
                        </div>
                    </>
                )}
            </Card>

            {/* Valori chiave */}
            <div className="grid mt-4 gap-4 md:grid-cols-4">
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Ore totali
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">
                        {formatDuration(totals.seconds)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {`${totals.count} attività`}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Euro className="h-4 w-4" />
                        Fatturato
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">
                        {formatCurrency(totals.earnings)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                        {`${(totals.seconds / 3600).toFixed(2)} ore`}
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Saldato
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">
                        {formatCurrency(totals.paid)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Già incassato</div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        Da incasasre
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">
                        {formatCurrency(totals.unpaid)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">In sospeso</div>
                </Card>
            </div>

            {/* Grafico per giorno */}
            <Card className="mt-4 p-4">
                <h2 className="text-sm font-semibold mb-3">Ore per giorno</h2>
                {byDay.data.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                        Nessun dato per i filtri scelti.
                    </div>
                ) : (
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byDay.data} barCategoryGap="20%">
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    minTickGap={24}
                                />
                                <YAxis
                                    stroke="var(--muted-foreground)"
                                    fontSize={12}
                                    domain={[0, "auto"]}
                                    tickFormatter={(v) => `${v}h`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: "var(--popover)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 8,
                                        color: "var(--popover-foreground)",
                                    }}
                                    formatter={(value, name) => [`${value} h`, name]}
                                />
                                {byDay.projects.map((project) => (
                                    <Bar
                                        key={project.key}
                                        dataKey={project.key}
                                        name={project.name}
                                        stackId="day"
                                        fill={project.color}
                                        radius={[0, 0, 0, 0]}
                                        maxBarSize={36}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>
            {/* Grafico per progetto */}
            <Card className="mt-4 p-4">
                <h2 className="text-sm font-semibold mb-3">Riepilogo per progetto</h2>
                {byProject.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        Nessun dato.
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 items-center">
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={byProject}
                                        dataKey="seconds"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={95}
                                        paddingAngle={2}
                                        stroke="var(--background)"
                                        strokeWidth={2}
                                    >
                                        {byProject.map((p) => (
                                            <Cell key={p.name} fill={p.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            background: "var(--popover)",
                                            border: "1px solid var(--border)",
                                            borderRadius: 8,
                                            color: "var(--popover-foreground)",
                                        }}
                                        formatter={(v, _n, item) => [
                                            `${formatDuration(v)} · ${((v / totals.seconds) * 100).toFixed(1)}%`,
                                            item?.payload?.name ?? "",
                                        ]}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        formatter={(value) => (
                                            <span className="text-xs text-muted-foreground">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="divide-y">
                            {byProject.map((p) => {
                                const pct = totals.seconds > 0 ? (p.seconds / totals.seconds) * 100 : 0;
                                return (
                                    <div
                                        key={p.name}
                                        className="flex items-center gap-3 py-3 text-sm"
                                    >
                                        <span
                                            className="h-3 w-3 rounded-full shrink-0"
                                            style={{ background: p.color }}
                                        />
                                        <div className="flex-1 min-w-0 truncate">
                                            <div className="truncate">{p.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {pct.toFixed(1)}%
                                            </div>
                                        </div>
                                        <div className="font-mono tabular-nums text-muted-foreground text-xs">
                                            {formatDuration(p.seconds)}
                                        </div>
                                        <div className="font-mono tabular-nums w-50 text-right">
                                            <b>Pagato</b>: {formatCurrency(p.amount)} su {formatCurrency(p.total)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </Card>

        </>
    );
}