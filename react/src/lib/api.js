export const api = (url, options = {}) =>
    fetch(url, { credentials: 'include', ...options });