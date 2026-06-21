"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { formatCurrency } from "@/lib/format"
import { AlertCircle, CheckCircle2, Clock, Euro } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
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

            <div className="grid mt-4 gap-4 md:grid-cols-4">
                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Ore totali
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">{"value"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{"sub"}</div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Euro className="h-4 w-4" />
                        Fatturato
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">{"value"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{"sub"}</div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        Saldato
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">{"value"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{"sub"}</div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="h-4 w-4 text-warning" />
                        Da incasasre
                    </div>
                    <div className="text-2xl font-semibold tabular-nums">{"value"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{"sub"}</div>
                </Card>
            </div>

            <Card className="mt-4 p-4">
                {JSON.stringify(filtered)}
            </Card>

        </>
    );
}