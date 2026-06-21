"use client"

import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/format";

const PRESET_COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
    "#6366f1",
];

export default function ProjectsPage() {

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

    const createProject = async (project) => {
        const response = await fetch(`/api/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json();
        setProjects((c) => [...c, data]);
    }

    const updateProject = async (project) => {
        const response = await fetch(`/api/projects/${project.idProject}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json();
        setProjects((c) => c.map(x => x.idProject == project.idProject ? data : x));
    }

    const deleteProject = async (project) => {
        const response = await fetch(`/api/projects/${project.idProject}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json();
        setProjects((c) => c.filter(x => x.idProject != project.idProject));
    }

    return (
        <>
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Progetti</h1>
                    <p className="text-muted-foreground mt-1">
                        Organizza i progetti dei tuoi projecti.
                    </p>
                </div>
                <ProjectDialog mode="create" onSubmit={createProject} clients={clients} />
            </header>
            <Card className="divide-y mt-4 p-0 gap-0">
                {projects.map((c) => (
                    <ProjectRow
                        key={c.idProject}
                        project={c}
                        updateProject={updateProject}
                        deleteProject={deleteProject}
                        clients={clients}
                    />
                ))}
            </Card>
        </>
    );
}


function ProjectRow({ project, updateProject, deleteProject, clients }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <span
                className="h-3 w-3 rounded-full"
                style={{ background: project.color }}
            />
            <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{project.name}</div>
                <div className="text-xs text-muted-foreground">
                    {project.client?.name ?? "—"}
                </div>
            </div>
            <div className="text-sm text-muted-foreground tabular-nums">
                {formatCurrency(Number(project.hourlyRate))} /h
            </div>
            <ProjectDialog mode="edit" project={project} onSubmit={updateProject} clients={clients} />
            <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                    if (confirm(`Eliminare "${project.name}"? Verranno rimosse anche le attività.`)) {
                        deleteProject(project)
                    }
                }}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

function ProjectDialog({
    mode,
    project,
    clients,
    onSubmit = async () => { }
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(project?.name ?? "");
    const [idClient, setIdClient] = useState(project?.idClient ?? "");
    const [hourlyRate, setHourlRate] = useState(String(project?.hourly_rate ?? "28"));
    const [color, setColor] = useState(project?.color ?? PRESET_COLORS[0]);
    const [notes, setNotes] = useState(project?.notes ?? "");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === "create" ? (
                    <Button>
                        <Plus className="h-4 w-4" />
                        Nuovo progetto
                    </Button>
                ) : (
                    <Button size="icon" variant="ghost">
                        <Pencil className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" ? "Nuovo progetto" : "Modifica progetto"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Cliente</Label>
                        <Select value={idClient} onValueChange={setIdClient}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleziona cliente" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients?.map((c) => (
                                    <SelectItem key={c.idClient} value={c.idClient}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Nome progetto</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Es. Creazione sito web"
                        />
                    </div>
                    <div>
                        <Label>Tariffa oraria (€)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={hourlyRate}
                            onChange={(e) => setHourlRate(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>Colore</Label>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className="h-8 w-8 rounded-full border-2 transition"
                                    style={{
                                        background: c,
                                        borderColor: color === c ? "var(--foreground)" : "transparent",
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>Annotazioni</Label>
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Note interne sul progetto, link, contatti…"
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={async () => {
                            await onSubmit({
                                idProject: project?.idProject,
                                name,
                                idClient,
                                color,
                                hourlyRate,
                                notes
                            });
                            setOpen(false)
                        }}
                    >
                        Salva
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
