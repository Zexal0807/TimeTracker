"use client"

import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Check,
    Copy,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
    formatCurrency,
    formatDuration,
} from '@/lib/format';

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
    const [clients, setClients] = useState([])
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);

    const toggleTaskSelection = (id) => {
        setSelectedTaskIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const totalSelectedDuration = useMemo(() => {
        return selectedTaskIds.reduce((sum, id) => {
            const task = tasks.find((t) => t.idTask === id);
            if (task) {
                const diff = new Date(task.endDateTime) - new Date(task.startDateTime);
                return sum + diff / 1000;
            }
            return sum;
        }, 0);
    }, [selectedTaskIds, tasks]);

    const handleBulkMarkPaid = async () => {
        for (const id of selectedTaskIds) {
            const task = tasks.find((t) => t.idTask === id);
            if (task && !task.paid) {
                await updateTask({ ...task, paid: true });
            }
        }
        setSelectedTaskIds([]);
    };

    const handleBulkMarkUnpaid = async () => {
        for (const id of selectedTaskIds) {
            const task = tasks.find((t) => t.idTask === id);
            if (task && task.paid) {
                await updateTask({ ...task, paid: false });
            }
        }
        setSelectedTaskIds([]);
    };

    const handleBulkChangeProject = async (projectId) => {
        for (const id of selectedTaskIds) {
            const task = tasks.find((t) => t.idTask === id);
            if (task) {
                await updateTask({ ...task, idProject: Number(projectId) });
            }
        }
        setSelectedTaskIds([]);
    };

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

    const [idClient, setIdClient] = useState("all");
    const [idProject, setIdProject] = useState("all");

    const filteredProjects = useMemo(
        () => idClient == "all"
            ? projects
            : projects.filter((p) => p.idClient == idClient),
        [projects, idClient]
    );
    const filtered = useMemo(() => {
        return tasks.filter((e) => {
            if (idClient !== "all" && e.project?.idClient !== idClient)
                return false;
            if (idProject !== "all" && e.idProject !== idProject)
                return false;
            return true;
        });
    }, [tasks, idClient, idProject]);

    const grouppedTasks = useMemo(() => {
        const map = new Map();
        for (const e of filtered) {
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
    }, [filtered])

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

    const [open, setOpen] = useState(false)

    return (
        <>
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Attività</h1>
                    <p className="text-muted-foreground mt-1">
                        Traccia il tempo delle attività.
                    </p>
                </div>
                <TaskDialog
                    task={{
                        startDateTime: new Date().setHours(new Date().getHours() - 1),
                        endDateTime: new Date()
                    }}
                    projects={projects}
                    open={open}
                    onOpenChange={setOpen}
                    onSubmit={createTask}
                />
                <Button onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Nuova task
                </Button>
            </header>

            <section className="mt-4 space-y-4">
                <div className="flex items-baseline justify-between">
                    <h2 className="text-lg font-semibold">Ultime attività</h2>
                </div>

                {/* Filtri */}
                <div className="grid gap-3 grid-cols-3">
                    <div></div>
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
                </div>

                {/* Bulk actions toolbar sotto i filtri */}
                {selectedTaskIds.length > 0 && (
                    <div className="mt-3 bg-muted/50 rounded-lg border border-border flex items-center gap-2">
                        <div className="flex-1 px-4 py-2.5 flex items-center gap-2">
                            <span className="text-muted-foreground">Task selezionate:</span>
                            <span className="font-semibold text-foreground">{selectedTaskIds.length}</span>
                            <span className="text-muted-foreground">({formatDuration(totalSelectedDuration)})</span>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            <Button variant="outline" size="sm" className="text-xs" onClick={handleBulkMarkPaid}>Segna come saldato</Button>
                            <Button variant="outline" size="sm" className="text-xs" onClick={handleBulkMarkUnpaid}>Segna come da incassare</Button>
                            <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => setSelectedTaskIds([])}>Annulla selezione</Button>
                        </div>
                    </div>
                )}

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
                                        projects={projects}
                                        deleteTask={deleteTask}
                                        updateTask={updateTask}
                                        duplicateTask={() => { createTask({ ...task, paid: false }) }}
                                        toggleTaskSelection={toggleTaskSelection}
                                        isSelected={selectedTaskIds.includes(task.idTask)}
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

function TaskRow({ task, projects, updateTask, deleteTask, duplicateTask, toggleTaskSelection, isSelected }) {

    const [startTime, setStartTime] = useState("")
    useEffect(() => {
        if (!task.startDateTime) return setStartTime("");

        const d = new Date(task.startDateTime);
        setStartTime(
            `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
        );
    }, [task.startDateTime]);

    const [endTime, setEndTime] = useState("")
    useEffect(() => {
        if (!task.endDateTime) return setEndTime("");

        const d = new Date(task.endDateTime);
        setEndTime(
            `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
        );
    }, [task.endDateTime]);

    const [editing, setEditing] = useState(false);

    const [taskName, setTaskName] = useState(task.name);
    useEffect(() => {
        setTaskName(task.name);
    }, [task.name]);

    return (
        <div className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/40'}`}>
            <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleTaskSelection(task.idTask)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <div className="flex-1 min-w-0">
                <Input
                    value={taskName}
                    onChange={(e) => {
                        setTaskName(e.target.value);
                    }}
                    onBlur={(e) => {
                        const updatedTask = { ...task, name: taskName };
                        if (taskName != task.name)
                            updateTask(updatedTask);
                    }}
                    className="font-medium truncate focus:outline-none focus:ring-1 focus:ring-primary"
                />
            </div>
            <div className="flex items-center gap-3 justify-end">

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
                <div className="font-mono tabular-nums font-semibold">
                    {formatDuration(new Date(task.endDateTime) / 1000 - new Date(task.startDateTime) / 1000)}
                </div>
            </div>
            <div className="flex items-center gap-2">
                {task.hourlyRate !== undefined && task.hourlyRate !== null && (
                    <span className="text-xs text-muted-foreground font-mono">
                        {formatCurrency(task.hourlyRate)}/h
                    </span>
                )}
                {task.paid
                    ? (
                        <Badge className="bg-success text-success-foreground hover:bg-success/90">
                            <Check className="h-3 w-3" /> Saldato
                        </Badge>
                    )
                    : (
                        <Badge variant="outline">Da incassare</Badge>
                    )
                }

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
                        <DropdownMenuItem onClick={() => setEditing(true)}>
                            <Pencil className="h-4 w-4" /> Modifica
                        </DropdownMenuItem>
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
                {editing && (
                    <TaskDialog
                        task={task}
                        projects={projects}
                        open={editing}
                        onOpenChange={setEditing}
                        onSubmit={updateTask}
                    />
                )}
            </div>
        </div>
    );
}

function toDateTimeLocalValue(value) {
    if (!value) return "";

    const d = new Date(value);
    // Convert to local time by offsetting
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
    return localISOTime;
}

function fromDateTimeLocalValue(value) {
    if (!value) return null;
    return new Date(value).toISOString();
}

function TaskDialog({
    task,
    projects,
    open,
    onOpenChange,
    onSubmit
}) {
    const [name, setName] = useState(task.name ?? "");
    const [startDateTime, setStartDateTime] = useState(toDateTimeLocalValue(task.startDateTime));
    const [endDateTime, setEndDateTime] = useState(toDateTimeLocalValue(task.endDateTime));
    const [idProject, setIdProject] = useState(task.idProject ?? "");
    const [paid, setPaid] = useState(task.paid ?? false);
    const [hourlyRate, setHourlyRate] = useState(task.hourlyRate ?? "");
    const [isLoading, setIsLoading] = useState(false);

    // Aggiorna hourlyRate quando cambia il progetto (se è una nuova task)
    useEffect(() => {
        if (!task.idTask && idProject) {
            const selectedProject = projects?.find((p) => String(p.idProject) === String(idProject));
            if (selectedProject) {
                setHourlyRate(String(selectedProject.hourlyRate));
            }
        }
    }, [idProject, projects, task.idTask]);

    const handleSubmit = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const start = new Date(startDateTime).toISOString();
            const end = new Date(endDateTime).toISOString();

            await onSubmit({
                ...task,
                name,
                startDateTime: start,
                endDateTime: end,
                idProject: Number(idProject),
                hourlyRate: Number(hourlyRate),
                paid
            });
            onOpenChange(false);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{task?.idTask ? "Modifica attività" : "Nuova attività"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Nome attività</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <Label>Progetto</Label>
                        <Select value={idProject} onValueChange={setIdProject} disabled={isLoading}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleziona progetto" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects?.map((p) => (
                                    <SelectItem key={p.idProject} value={p.idProject}>
                                        {p.name} ({p.client?.name})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Prezzo orario (€)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Inizio</Label>
                            <Input
                                type="datetime-local"
                                value={startDateTime}
                                onChange={(e) => setStartDateTime(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <Label>Fine</Label>
                            <Input
                                type="datetime-local"
                                value={endDateTime}
                                onChange={(e) => setEndDateTime(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                        <Label htmlFor="paid">Saldato</Label>
                        <Switch
                            id="paid"
                            checked={paid}
                            onCheckedChange={setPaid}
                            disabled={isLoading}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Salvataggio..." : "Salva"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}