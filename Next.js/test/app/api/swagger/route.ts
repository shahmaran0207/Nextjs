// app/api/swagger/route.ts
import { NextResponse } from "next/server";
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

export async function GET() {
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "MY API",
                version: "1.0.0",
                description: "API 문서",
            },
            servers: [
                {
                    url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
                    description: "Development server",
                },
            ],
        },
        // 여러 경로 패턴을 명시적으로 지정
        apis: [
            path.join(process.cwd(), "app/api/**/*.ts"),
            path.join(process.cwd(), "app/api/**/**/*.ts"),
            path.join(process.cwd(), "app/api/**/**/**/*.ts"),
        ],
    };

    const spec = swaggerJsdoc(options);
    return NextResponse.json(spec);
}