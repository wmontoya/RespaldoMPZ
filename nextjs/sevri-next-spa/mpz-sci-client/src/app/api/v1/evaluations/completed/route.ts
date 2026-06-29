import { put } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
    _req: NextRequest,
) {
    try {
        const { body } = await _req.json();
        const response = await put(`/api/v1/mature-model/evaluations/completed`, body)
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        return NextResponse.json(error);
    }
}
