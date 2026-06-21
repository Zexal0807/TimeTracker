import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
    try {
        const idProject = parseInt((await params).idProject)

        if (isNaN(idProject)) {
            return NextResponse.json(
                { error: 'ID progetto non valido' },
                { status: 400 }
            )
        }

        const project = await prisma.project.findUnique({
            where: { idProject },
            include: {
                client: true,
                tasks: true,
            },
        })

        if (!project) {
            return NextResponse.json(
                { error: 'Progetto non trovato' },
                { status: 404 }
            )
        }

        return NextResponse.json(project, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante il recupero del progetto' },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        const idProject = parseInt((await params).idProject)

        const body = await request.json()
        const { name, color, hourly_rate, notes, idClient } = body

        if (isNaN(idProject)) {
            return NextResponse.json(
                { error: 'ID progetto non valido' },
                { status: 400 }
            )
        }

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

        const project = await prisma.project.update({
            where: { idProject },
            data: {
                name: name.trim(),
                color: color?.trim() || undefined,
                hourly_rate: Number(hourly_rate),
                notes: notes.trim(),
                idClient: Number(idClient),
            },
            include: {
                client: true,
                tasks: true,
            },
        })

        return NextResponse.json(project, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante l\'aggiornamento del progetto' },
            { status: 500 }
        )
    }
}

export async function DELETE(request, { params }) {
    try {
        const idProject = parseInt((await params).idProject)

        if (isNaN(idProject)) {
            return NextResponse.json(
                { error: 'ID progetto non valido' },
                { status: 400 }
            )
        }

        await prisma.project.delete({
            where: { idProject },
        })

        return NextResponse.json(
            { message: 'Progetto eliminato con successo' },
            { status: 200 }
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante l\'eliminazione del progetto' },
            { status: 500 }
        )
    }
}