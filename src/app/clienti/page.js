"use client"

import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function ClientsPage() {

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
    }, [])

    const createClient = async (client) => {
        const response = await fetch(`/api/clients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(client)
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json();
        setClients((c) => [...c, data]);
    }

    const updateClient = async (client) => {
        const response = await fetch(`/api/clients/${client.idClient}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(client)
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json();
        setClients((c) => c.map(x => x.idClient == client.idClient ? data : x));
    }

    const deleteClient = async (client) => {
        const response = await fetch(`/api/clients/${client.idClient}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
        }

        const data = await response.json();
        setClients((c) => c.filter(x => x.idClient != client.idClient));
    }

    return (
        <>
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Clienti</h1>
                    <p className="text-muted-foreground mt-1">
                        Organizza i clienti per cui registri attività.
                    </p>
                </div>
                <ClientDialog mode="create" onSubmit={createClient} />
            </header>
            <Card className="divide-y mt-4 p-0 gap-0">
                {clients.map((c) => (
                    <ClientRow
                        key={c.idClient}
                        client={c}
                        updateClient={updateClient}
                        deleteClient={deleteClient}
                    />
                ))}
            </Card>
        </>
    );
}


function ClientRow({ client, updateClient, deleteClient }) {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <User className="h-6 w-6" />
            <div className="flex-1 font-medium">{client.name}</div>
            <ClientDialog mode="edit" client={client} onSubmit={updateClient} />
            <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                    if (confirm(`Eliminare "${client.name}"? Verranno rimossi anche progetti e attività.`)) {
                        deleteClient(client)
                    }
                }}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}

function ClientDialog({
    mode,
    client,
    onSubmit = async () => { }
}) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState(client?.name ?? "");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {mode === "create" ? (
                    <Button>
                        <Plus className="h-4 w-4" />
                        Nuovo cliente
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
                        {mode === "create" ? "Nuovo cliente" : "Modifica cliente"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Nome</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Es. Acme S.r.l."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={async () => {
                            await onSubmit({
                                idClient: client?.idClient,
                                name
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
