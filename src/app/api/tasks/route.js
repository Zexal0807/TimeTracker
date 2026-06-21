import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const tasks = await prisma.task.findMany({
            // include: {
            //     project: true,
            // },
            // orderBy: {
            //     startDateTime: 'desc',
            // },
        })

        return NextResponse.json(tasks, { status: 200 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante il recupero delle task' },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { name, startDateTime, endDateTime, paid, idProject } = body

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

        const task = await prisma.task.create({
            data: {
                name: name.trim(),
                startDateTime: new Date(startDateTime),
                endDateTime: new Date(endDateTime),
                paid: typeof paid === 'boolean' ? paid : false,
                idProject: Number(idProject),
            },
            include: {
                project: true,
            },
        })

        return NextResponse.json(task, { status: 201 })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Errore durante la creazione della task' },
            { status: 500 }
        )
    }
}