import { get, getOdoo } from "@/app/api/v1/(functions)/config";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _req: NextRequest,
) {
    try {
        const url = new URL(_req.url)
        const department_id = url.searchParams.get("department_id")
        const response = await getOdoo(`/api/v1/sevri/proposed-actions/department/${department_id}`);
        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json(error);
    }
}
