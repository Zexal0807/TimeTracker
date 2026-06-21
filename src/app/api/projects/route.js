import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
        })

        return NextResponse.json(projects, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante il recupero dei progetti' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { name, color, hourly_rate, notes, idClient } = body

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Il campo name è obbligatorio' },
                { status: 400 }
            )
        }

        if (hourly_rate === undefined || hourly_rate === null || isNaN(Number(hourly_rate))) {
            return NextResponse.json(
                { error: 'Il campo hourly_rate è obbligatorio e deve essere numerico' },
                { status: 400 }
            )
        }

        if (notes === undefined || typeof notes !== 'string') {
            return NextResponse.json(
                { error: 'Il campo notes è obbligatorio' },
                { status: 400 }
            )
        }

        if (!idClient || isNaN(Number(idClient))) {
            return NextResponse.json(
                { error: 'Il campo idClient è obbligatorio e deve essere numerico' },
                { status: 400 }
            )
        }

        const project = await prisma.project.create({
            data: {
                name: name.trim(),
                color: color?.trim() || undefined,
                hourly_rate: Number(hourly_rate),
                notes: notes.trim(),
                idClient: Number(idClient),
            },
            include: {
                client: true,
            },
        })

        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante la creazione del progetto' },
            { status: 500 }
        )
    }
}