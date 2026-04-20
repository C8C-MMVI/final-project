// src/lib/api.js

// ── PHP backend (auth, repairs, shops, users) ─────────────────────────────
// All PHP routes go through Vite's proxy → /api/... → http://localhost:8080
export const api = (url, options = {}) =>
    fetch(url, { credentials: 'include', ...options });

// ── Spring Boot backend (sales) ───────────────────────────────────────────
// Spring Boot runs on port 8081 (docker: 8081:8080)
const SPRING_BASE = 'http://localhost:8081';

export const springApi = (path, options = {}) =>
    fetch(`${SPRING_BASE}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
        ...options,
    });

// ── Convenience helpers for repair sales ─────────────────────────────────

/** Create a new sale for a completed repair */
export const createSale = (body) =>
    springApi('/api/sales', {
        method: 'POST',
        body: JSON.stringify(body),
    });

/** Get all sales for a shop (owner dashboard) */
export const getSalesByShop = (shopId) =>
    springApi(`/api/sales/shop/${shopId}`);

/** Get all sales for a customer (customer transactions) */
export const getSalesByCustomer = (customerId) =>
    springApi(`/api/sales/customer/${customerId}`);

/** Get the sale linked to a specific repair request */
export const getSaleByRepair = (requestId) =>
    springApi(`/api/sales/by-repair/${requestId}`);