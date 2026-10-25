// API base URL: defaults to localhost:3000 in dev, or VITE_API_URL on Render/Vercel
function resolveApiUrl(raw) {
    const url = (raw || "").trim();
    if (!url) return "http://localhost:3000";

    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return withProtocol.replace(/\/+$/, "");
}

export const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL);

async function request(url, options = {}) {
    let response;
    try {
        response = await fetch(url, options);
    } catch (networkError) {
        const errorDetail = networkError?.message || "Failed to fetch";
        throw new Error(
            `Could not connect to backend API (${url}): ${errorDetail}. ` +
            `Please ensure your backend service is running and CORS is enabled.`,
            { cause: networkError }
        );
    }

    if (!response.ok) {
        let errorDetails = "";
        try {
            const body = await response.text();
            if (body) {
                try {
                    const parsed = JSON.parse(body);
                    errorDetails = parsed.message || parsed.error || body;
                } catch {
                    errorDetails = body.length > 120 ? `${body.slice(0, 120)}...` : body;
                }
            }
        } catch {
            // ignore failure reading error response body
        }

        const statusInfo = response.statusText ? ` (${response.statusText})` : "";
        const detailSuffix = errorDetails ? `: ${errorDetails}` : "";
        throw new Error(`Server returned HTTP ${response.status}${statusInfo}${detailSuffix}`);
    }

    if (response.status === 204) {
        return null;
    }

    let text;
    try {
        text = await response.text();
    } catch (readError) {
        throw new Error(`Failed to read response body from ${url}: ${readError?.message}`, { cause: readError });
    }

    if (!text || !text.trim()) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch (jsonError) {
        throw new Error(
            `Received invalid JSON from ${url}. ` +
            `The server may have returned an HTML error or non-JSON page.`,
            { cause: jsonError }
        );
    }
}

function createAPI(resource) {
    const url = `${API_URL}/${resource}`;

    return {
        getAll: () => request(url),
        getById: (id) => request(`${url}/${id}`),

        create: (data) =>
            request(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }),

        update: (id, data) =>
            request(`${url}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            }),

        remove: (id) =>
            request(`${url}/${id}`, { method: "DELETE" })
    };
}

export const restaurantsAPI = createAPI("restaurants");
export const foodsAPI = createAPI("foods");
export const ordersAPI = createAPI("orders");
