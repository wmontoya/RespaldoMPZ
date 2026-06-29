import { get, getOdoo, post, postOdoo, put } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";
export async function POST(
    _req: NextRequest,
) {
    try {
        const { body } = await _req.json();
        const response = await postOdoo(`/api/v1/mature-model/proposed-actions`, body)
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}
export async function GET(
    _req: NextRequest,
) {
    try {
        const url = new URL(_req.url)
        const department_id = url.searchParams.get("department_id")
        const response = await getOdoo(`/api/v1/mature-model/proposed-actions/${department_id}`);
        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}
