export function formatDuration(seconds) {
    if (!seconds || seconds < 0) seconds = 0;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return [h, m, s].map((n) => n.toString().padStart(2, "0")).join(":");
}

export function formatHoursDecimal(seconds) {
    return (seconds / 3600).toFixed(2);
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
    }).format(amount || 0);
}

export function formatDate(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(d);
}

export function formatDateTime(date) {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}
