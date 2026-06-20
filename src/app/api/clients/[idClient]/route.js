import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
    try {
        const idClient = parseInt((await params).idClient)

        if (isNaN(idClient)) {
            return NextResponse.json(
                { error: 'ID non valido' },
                { status: 400 }
            )
        }

        const client = await prisma.client.findUnique({
            where: { idClient },
        })

        if (!client) {
            return NextResponse.json(
                { error: 'Client non trovato' },
                { status: 404 }
            )
        }

        return NextResponse.json(client)
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante il recupero del client' },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        const idClient = parseInt((await params).idClient)

        if (isNaN(idClient)) {
            return NextResponse.json(
                { error: 'ID non valido' },
                { status: 400 }
            )
        }

        const body = await request.json()
        const { name, color } = body

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Il campo name è obbligatorio' },
                { status: 400 }
            )
        }

        const existingClient = await prisma.client.findUnique({
            where: { idClient },
        })

        if (!existingClient) {
            return NextResponse.json(
                { error: 'Client non trovato' },
                { status: 404 }
            )
        }

        const updatedClient = await prisma.client.update({
            where: { idClient },
            data: {
                name: name.trim(),
                color: color?.trim() || undefined,
            },
        })

        return NextResponse.json(updatedClient)
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante l’aggiornamento del client' },
            { status: 500 }
        )
    }
}

export async function DELETE(request, { params }) {
    try {
        const idClient = parseInt((await params).idClient)

        if (isNaN(idClient)) {
            return NextResponse.json(
                { error: 'ID non valido' },
                { status: 400 }
            )
        }

        const existingClient = await prisma.client.findUnique({
            where: { idClient },
        })

        if (!existingClient) {
            return NextResponse.json(
                { error: 'Client non trovato' },
                { status: 404 }
            )
        }

        await prisma.client.delete({
            where: { idClient },
        })

        return NextResponse.json(
            { message: 'Client eliminato con successo' },
            { status: 200 }
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante l’eliminazione del client' },
            { status: 500 }
        )
    }
}