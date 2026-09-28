const API_URL = "http://localhost:3000/api";

const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
};

export const loginUser = async (email, password) => {
    return request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
};

export const getProducts = async (params = "") => {
    return request(`/products${params}`);
};

export const getProductStats = async () => {
    return request("/products/stats");
};

export const getReorderProducts = async () => {
    return request("/products/reorder");
};

export const getCategories = async () => {
    return request("/categories");
};

export const updateStock = async (id, stockQuantity, reason) => {
    return request(`/products/${id}/stock`, {
        method: "PATCH",
        body: JSON.stringify({
            stockQuantity,
            reason
        })
    });
};

export const createProduct = async (product) => {
    return request("/products", {
        method: "POST",
        body: JSON.stringify(product)
    });
};

export const createCategory = async (category) => {
    return request("/categories", {
        method: "POST",
        body: JSON.stringify(category)
    });
};

export const getStockMovements = async () => {
    return request("/stock-movements");
};
