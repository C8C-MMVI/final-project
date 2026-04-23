// src/lib/api.js

// ── PHP backend (auth, repairs, shops, users) ─────────────────────────────
// Vite proxy forwards /api/... → gateway:9090 → php:8000
export const api = (url, options = {}) =>
    fetch(url, { credentials: 'include', ...options });

// ── Spring Boot backend (sales) ───────────────────────────────────────────
// Vite proxy forwards /sales/... → gateway:9090 → springboot:8080
export const springApi = (path, options = {}) =>
    fetch(path, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
        ...options,
    });

// ── Convenience helpers ───────────────────────────────────────────────────

export const createSale = (body) =>
    springApi('/api/sales', {
        method: 'POST',
        body: JSON.stringify(body),
    });

export const getSalesByShop = (shopId) =>
    springApi(`/api/sales/shop/${shopId}`);

export const getSalesByCustomer = (customerId) =>
    springApi(`/api/sales/customer/${customerId}`);

export const getSaleByRepair = (requestId) =>
    springApi(`/api/sales/by-repair/${requestId}`);