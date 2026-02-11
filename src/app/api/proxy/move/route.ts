
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/constants';

export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const resourceId = searchParams.get('resource_id');
        const folderId = searchParams.get('folder_id');
        const auth = request.headers.get('Authorization');

        if (!resourceId) {
            return NextResponse.json({ error: 'Missing resource_id' }, { status: 400 });
        }

        // Create URL using URLSearchParams for cleaner construction
        const targetUrl = new URL(`${API_BASE_URL}/api/resources/${resourceId}/move`);

        // folder_id is a query parameter.
        // If folderId is not null/undefined, we append it.
        // For root moves, we'll try OMITTING it first to see if the backend defaults to root.
        if (folderId && folderId !== 'null' && folderId !== 'undefined') {
            targetUrl.searchParams.append('folder_id', folderId);
        } else {
            console.log("Proxy Move: Moving to root (omitting folder_id)");
        }

        console.log("Proxy: Forwarding to:", targetUrl.toString());

        const response = await fetch(targetUrl.toString(), {
            method: 'PATCH',
            headers: {
                ...(auth ? { 'Authorization': auth } : {}),
            },
        });

        // Get raw response text for detailed logging
        const responseText = await response.text();
        let responseData;
        try {
            responseData = JSON.parse(responseText);
        } catch (e) {
            responseData = { rawResponse: responseText };
        }

        console.log("Proxy Move: Backend Response:", {
            status: response.status,
            data: responseData
        });

        return NextResponse.json(responseData, { status: response.status });

    } catch (error) {
        console.error('Move Resource Proxy Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
