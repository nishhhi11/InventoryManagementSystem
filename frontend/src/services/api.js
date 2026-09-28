const API_URL = "http://localhost:3000/api";

const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        cache: 'no-store',
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

export const loginUser = (email, password) =>
    request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });

export const getProducts = (params = "") =>
    request(`/products${params}`);

export const getProductStats = () =>
    request("/products/stats");

export const getReorderProducts = () =>
    request("/products/reorder");

export const getCategories = () =>
    request("/categories");

export const updateStock = (id, stockQuantity, reason) =>
    request(`/products/${id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ stockQuantity, reason })
    });

export const createProduct = product =>
    request("/products", {
        method: "POST",
        body: JSON.stringify(product)
    });

export const createCategory = category =>
    request("/categories", {
        method: "POST",
        body: JSON.stringify(category)
    });

export const getStockMovements = () =>
    request("/stock-movements");

export const getActivityLogs = () =>
    request("/activity-logs");