
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { fileUrl } = await request.json();
        const authHeader = request.headers.get('Authorization');

        if (!fileUrl) {
            return NextResponse.json({ error: 'Missing fileUrl' }, { status: 400 });
        }

        const fullUrl = fileUrl.startsWith('http') ? fileUrl : `https://shiksha-gpt.com${fileUrl}`;

        // Forward the request to the actual backend
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                // Pass the authorization header
                ...(authHeader ? { 'Authorization': authHeader } : {}),
            },
        });

        if (!response.ok) {
            console.error(`Proxy failed for ${fullUrl}: ${response.status} ${response.statusText}`);
            return NextResponse.json(
                { error: 'Failed to fetch file from remote server' },
                { status: response.status }
            );
        }

        // Get the file content as an ArrayBuffer
        const fileBuffer = await response.arrayBuffer();

        // Create headers for the response
        const headers = new Headers();
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const contentDisposition = response.headers.get('Content-Disposition');

        headers.set('Content-Type', contentType);
        if (contentDisposition) {
            headers.set('Content-Disposition', contentDisposition);
        }

        // Return the file content
        return new NextResponse(fileBuffer, {
            status: 200,
            headers,
        });

    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
