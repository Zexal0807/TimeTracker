import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
    try {
        const idTask = parseInt((await params).idTask)

        if (isNaN(idTask)) {
            return NextResponse.json(
                { error: 'ID task non valido' },
                { status: 400 }
            )
        }

        const task = await prisma.task.findUnique({
            where: { idTask },
            include: {
                project: {
                    include: {
                        client: true,
                    },
                },
            },
        })

        if (!task) {
            return NextResponse.json(
                { error: 'Task non trovata' },
                { status: 404 }
            )
        }

        return NextResponse.json(task, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante il recupero della task' },
            { status: 500 }
        )
    }
}

export async function PUT(request, { params }) {
    try {
        const idTask = parseInt((await params).idTask)

        const body = await request.json()
        const { name, startDateTime, endDateTime, paid, idProject } = body

        if (isNaN(idTask)) {
            return NextResponse.json(
                { error: 'ID task non valido' },
                { status: 400 }
            )
        }

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Il campo name è obbligatorio' },
                { status: 400 }
            )
        }

        if (!startDateTime) {
            return NextResponse.json(
                { error: 'Il campo startDateTime è obbligatorio' },
                { status: 400 }
            )
        }

        if (!endDateTime) {
            return NextResponse.json(
                { error: 'Il campo endDateTime è obbligatorio' },
                { status: 400 }
            )
        }

        if (!idProject || isNaN(Number(idProject))) {
            return NextResponse.json(
                { error: 'Il campo idProject è obbligatorio e deve essere numerico' },
                { status: 400 }
            )
        }

        const task = await prisma.task.update({
            where: { idTask },
            data: {
                name: name.trim(),
                startDateTime: new Date(startDateTime),
                endDateTime: new Date(endDateTime),
                paid: typeof paid === 'boolean' ? paid : false,
                idProject: Number(idProject),
            },
            include: {
                project: {
                    include: {
                        client: true
                    }
                },
            },
        })

        return NextResponse.json(task, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante l\'aggiornamento della task' },
            { status: 500 }
        )
    }
}

export async function DELETE(request, { params }) {
    try {
        const idTask = parseInt((await params).idTask)

        if (isNaN(idTask)) {
            return NextResponse.json(
                { error: 'ID task non valido' },
                { status: 400 }
            )
        }

        await prisma.task.delete({
            where: { idTask },
        })

        return NextResponse.json(
            { message: 'Task eliminata con successo' },
            { status: 200 }
        )
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante l\'eliminazione della task' },
            { status: 500 }
        )
    }
}