import { putOdoo, getOdoo, delOdoo } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { body } = await _req.json();
        const response = await putOdoo(`/api/v1/sevri/activities/${params.id}`, body);
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}

export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const response = await getOdoo(`/api/v1/sevri/activities/${params.id}`)
        return NextResponse.json(response, { status: 200 });
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
        const response = await delOdoo(`/api/v1/sevri/activities/${params.id}`);
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}