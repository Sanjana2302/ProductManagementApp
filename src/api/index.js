import api from "./axiosInstance";

// Auth
export const registerApi = (data) => api.post("/auth/register", data);
export const loginApi = (data) => api.post("/auth/login", data);
export const logoutApi = () => api.post("/auth/logout");
export const forgotPasswordApi = (email) => api.post("/auth/forgot-password", { email });
export const resetPasswordApi = (data) => api.post("/auth/reset-password", data);

// Products
export const getProductsApi = (search = "") => api.get(`/products?search=${search}`);
export const addProductApi = (data) => api.post("/products", data);
export const editProductApi = (id, data) => api.put(`/products/${id}`, data);
export const deleteProductApi = (id) => api.delete(`/products/${id}`);

// Dashboard
export const getDashboardApi = () => api.get("/dashboard");
