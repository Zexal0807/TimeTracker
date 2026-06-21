"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/lib/format";
import { Check, Copy, MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react"

function dayLabel(d) {
    const today = new Date();
    const yest = new Date();
    yest.setDate(yest.getDate() - 1);
    const same = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
    if (same(d, today)) return "Oggi";
    if (same(d, yest)) return "Ieri";
    return new Intl.DateTimeFormat("it-IT", {
        weekday: "long",
        day: "2-digit",
        month: "short",
    }).format(d);
}

export default function HomePage() {

    const [tasks, setTasks] = useState([])
    const [projects, setProjects] = useState([])

    useEffect(() => {
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

    const grouppedTasks = useMemo(() => {
        const map = new Map();
        for (const e of tasks) {
            const d = new Date(e.startDateTime);
            const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const g = map.get(key) ?? { date: d, entries: [], total: 0 };
            g.entries.push(e);
            g.total += new Date(e.endDateTime) / 1000 - new Date(e.startDateTime) / 1000 ?? 0;
            map.set(key, g);
        }
        return Array.from(map.values()).sort(
            (a, b) => b.date.getTime() - a.date.getTime(),
        );
    }, [tasks])

    const createTask = async (task) => {
        const response = await fetch(`/api/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json();
        setTasks((c) => [...c, data]);
    }

    const updateTask = async (task) => {
        const response = await fetch(`/api/tasks/${task.idTask}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json();
        setTasks((c) => c.map(x => x.idTask == task.idTask ? data : x));
    }

    const deleteTask = async (task) => {
        const response = await fetch(`/api/tasks/${task.idTask}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json();
        setTasks((c) => c.filter(x => x.idTask != task.idTask));
    }

    return (
        <>
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Attività</h1>
                    <p className="text-muted-foreground mt-1">
                        Traccia il tempo delle attività.
                    </p>
                </div>
                {/* <ClientDialog mode="create" onSubmit={createClient} /> */}
            </header>
            <Card className="divide-y mt-4 p-0 gap-0">
                TRACKER

                {JSON.stringify(tasks)}
            </Card>
            <section className="mt-4 space-y-4">
                <div className="flex items-baseline justify-between">
                    <h2 className="text-lg font-semibold">Ultime attività</h2>
                </div>
                <div className="space-y-4">
                    {grouppedTasks.map((g) => (
                        <Card className="overflow-hidden p-0 gap-0" key={g.date}>
                            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/60 border-b">
                                <span className="text-sm font-medium capitalize">{dayLabel(g.date)}</span>
                                <span className="text-sm text-muted-foreground">
                                    Totale: <span className="font-mono tabular-nums font-semibold text-foreground">
                                        {formatDuration(g.total)}
                                    </span>
                                </span>
                            </div>
                            <div className="divide-y">
                                {g.entries.map((task) => (
                                    <TaskRow
                                        key={task.idTask}
                                        task={task}
                                        deleteTask={deleteTask}
                                        updateTask={updateTask}
                                        duplicateTask={() => { createTask({ ...task, paid: false }) }}
                                    />
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </>
    );
}


function TaskRow({ task, updateTask, deleteTask, duplicateTask }) {

    const [startTime, setStartTime] = useState(task.startDateTime.substr(11, 8))
    useEffect(() => {
        if (!task.startDateTime) return setStartTime("");

        const d = new Date(task.startDateTime);
        setStartTime(
            `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
        );
    }, [task.startDateTime]);

    const [endTime, setEndTime] = useState(task.endDateTime.substr(11, 8))
    useEffect(() => {
        if (!task.endDateTime) return setEndTime("");

        const d = new Date(task.endDateTime);
        setEndTime(
            `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
        );
    }, [task.endDateTime]);


    return (
        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/40 transition-colors">
            <div className="w-35/100">
                {task.name}
            </div>
            <div className="w-50/100 flex items-center gap-3 justify-end">
                <div className="flex items-center gap-2 text-sm min-w-0">
                    <span
                        className="inline-block h-2 w-2 rounded-full shrink-0"
                        style={{ background: task.project?.color ?? "#3b82f6" }}
                    />
                    <span className="truncate max-w-[200px]">
                        <span className="font-medium" style={{ color: task.project?.color ?? undefined }}>
                            {task.project?.name ?? "—"}
                        </span>
                        <span className="text-muted-foreground"> · {task.project?.client?.name ?? "—"}</span>
                    </span>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-sm">
                    <Input
                        type="time"
                        value={startTime}
                        onChange={(ev) => setStartTime(ev.target.value)}
                        onBlur={() => {
                            const date = task.startDateTime?.slice(0, 10) || "";
                            if (!date || !startTime) return;

                            const d = new Date(task.startDateTime);
                            const [hh, mm] = startTime.split(":");

                            d.setHours(Number(hh), Number(mm), 0, 0);

                            updateTask({
                                ...task,
                                startDateTime: d.toISOString(),
                            });
                        }}
                        className="w-40 h-8 px-2 font-mono tabular-nums"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                        type="time"
                        value={endTime}
                        onChange={(ev) => setEndTime(ev.target.value)}
                        onBlur={() => {
                            const date = task.endDateTime?.slice(0, 10) || "";
                            if (!date || !endTime) return;

                            const d = new Date(task.endDateTime);
                            const [hh, mm] = endTime.split(":");

                            d.setHours(Number(hh), Number(mm), 0, 0);

                            updateTask({
                                ...task,
                                endDateTime: d.toISOString(),
                            });
                        }}
                        className="w-40 h-8 px-2 font-mono tabular-nums"
                    />
                </div>
                <div className="text-right shrink-0">
                    <div className="font-mono tabular-nums font-semibold">
                        {formatDuration(new Date(task.endDateTime) / 1000 - new Date(task.startDateTime) / 1000)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {/* {formatCurrency(earnings)} */}
                    </div>
                </div>
            </div>
            <div className="w-15/100 flex items-center justify-between">
                {task.paid
                    ? (
                        <Badge className="bg-success text-success-foreground hover:bg-success/90">
                            <Check className="h-3 w-3" /> Saldato
                        </Badge>
                    )
                    : (
                        <Badge variant="outline">Da incassare</Badge>
                    )}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={duplicateTask}>
                            <Copy className="h-4 w-4" /> Duplica
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem onClick={() => setEditing(true)}>
                            <Pencil className="h-4 w-4" /> Modifica completa
                        </DropdownMenuItem> */}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                                if (confirm(`Eliminare "${task.name}"?`)) {
                                    deleteTask(task)
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 text-destructive focus:text-destructive" /> Elimina
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                {/* {editing && (
                <EditEntryDialog
                    task={task}
                    open={editing}
                    onOpenChange={setEditing}
                />
            )} */}
            </div>
        </div>
    );
}
