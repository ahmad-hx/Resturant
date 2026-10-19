const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
// Remove any trailing slashes to keep endpoint URL paths consistent
const API_URL = rawApiUrl.replace(/\/+$/, "");

async function request(url, options = {}) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    if (response.status === 204) {
        return null;
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
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
