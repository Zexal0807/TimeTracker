import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const clients = await prisma.client.findMany({

        })

        return NextResponse.json(clients)
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante il recupero dei client' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { name, color } = body

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Il campo name è obbligatorio' },
                { status: 400 }
            )
        }

        const client = await prisma.client.create({
            data: {
                name: name.trim(),
                color: color?.trim() || undefined,
            },
        })

        return NextResponse.json(client, { status: 201 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante la creazione del client' },
            { status: 500 }
        )
    }
}