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

// ── Django backend (booking, repair, shop) ────────────────────────────────
// Vite proxy forwards /django/... → gateway:9090 → django:8001
export const djangoApi = (path, options = {}) =>
    fetch(path, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${localStorage.getItem('django_token') ?? ''}`,
            ...(options.headers ?? {}),
        },
        ...options,
    });

// ── Convenience helpers ───────────────────────────────────────────────────

// Spring Boot: Sales
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

// Django: Shop  →  /django/shop/shops/
export const getShops = () =>
    djangoApi('/django/shop/shops/');
export const getShopById = (id) =>
    djangoApi(`/django/shop/shops/${id}/`);
export const createShop = (body) =>
    djangoApi('/django/shop/shops/', { method: 'POST', body: JSON.stringify(body) });
export const updateShop = (id, body) =>
    djangoApi(`/django/shop/shops/${id}/`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteShop = (id) =>
    djangoApi(`/django/shop/shops/${id}/`, { method: 'DELETE' });

// Django: Repair  →  /django/repair/requests/
export const getRepairRequests = () =>
    djangoApi('/django/repair/requests/');
export const getRepairRequestById = (id) =>
    djangoApi(`/django/repair/requests/${id}/`);
export const createRepairRequest = (body) =>
    djangoApi('/django/repair/requests/', { method: 'POST', body: JSON.stringify(body) });
export const updateRepairRequest = (id, body) =>
    djangoApi(`/django/repair/requests/${id}/`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteRepairRequest = (id) =>
    djangoApi(`/django/repair/requests/${id}/`, { method: 'DELETE' });

// Django: Booking  →  /django/booking/bookings/
export const getBookings = () =>
    djangoApi('/django/booking/bookings/');
export const getBookingById = (id) =>
    djangoApi(`/django/booking/bookings/${id}/`);
export const createBooking = (body) =>
    djangoApi('/django/booking/bookings/', { method: 'POST', body: JSON.stringify(body) });
export const updateBooking = (id, body) =>
    djangoApi(`/django/booking/bookings/${id}/`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteBooking = (id) =>
    djangoApi(`/django/booking/bookings/${id}/`, { method: 'DELETE' });

// Django: Shop Services  →  /django/booking/services/
export const getShopServices = () =>
    djangoApi('/django/booking/services/');
export const getShopServiceById = (id) =>
    djangoApi(`/django/booking/services/${id}/`);
export const createShopService = (body) =>
    djangoApi('/django/booking/services/', { method: 'POST', body: JSON.stringify(body) });
export const updateShopService = (id, body) =>
    djangoApi(`/django/booking/services/${id}/`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteShopService = (id) =>
    djangoApi(`/django/booking/services/${id}/`, { method: 'DELETE' });

// Django: Shop Availability  →  /django/booking/availability/
export const getShopAvailability = () =>
    djangoApi('/django/booking/availability/');
export const getShopAvailabilityById = (id) =>
    djangoApi(`/django/booking/availability/${id}/`);
export const createShopAvailability = (body) =>
    djangoApi('/django/booking/availability/', { method: 'POST', body: JSON.stringify(body) });
export const updateShopAvailability = (id, body) =>
    djangoApi(`/django/booking/availability/${id}/`, { method: 'PUT', body: JSON.stringify(body) });
export const deleteShopAvailability = (id) =>
    djangoApi(`/django/booking/availability/${id}/`, { method: 'DELETE' });