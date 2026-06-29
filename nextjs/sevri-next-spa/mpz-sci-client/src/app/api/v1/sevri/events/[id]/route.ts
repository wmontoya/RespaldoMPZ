import { del, put } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { body } = await _req.json();
        const response = await put(`/api/v1/sevri/events/${params.id}`, body)
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const response = await del(`/api/v1/sevri/events/${params.id}`);
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}