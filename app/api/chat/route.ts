import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    //   ai will be implemented here in the future to generate a response based on the user's message

    return NextResponse.json({
        success: true,
        method: 'POST',
        body,
        receivedAt: new Date().toISOString(),
    });
}
