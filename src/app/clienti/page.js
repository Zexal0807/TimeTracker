"use client"

import { useEffect, useState } from "react";

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


    return (
        <div>
            CLIENTI
            {JSON.stringify(clients)}
        </div>
    );
}
