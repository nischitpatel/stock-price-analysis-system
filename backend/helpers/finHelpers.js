// utils/finHelpers.js
export const ymd = (d) => {
    const z = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};

export function computePeriodRange(type, from, to) {
    const end = to ? new Date(to) : new Date();
    const start = from ? new Date(from) : new Date(end);
    if (!from) {
        if (type === "quarterly") start.setFullYear(end.getFullYear() - 3);
        else if (type === "trailing") start.setFullYear(end.getFullYear() - 2);
        else start.setFullYear(end.getFullYear() - 10); // annual
    }
    return { period1: ymd(start), period2: ymd(end) };
}

// Generic field getter that works for BOTH balance sheet & income statement.
// Tries prefixed (annual*/quarterly*/trailing*), then unprefixed, then camelCase.
// Case-insensitive, returns only numbers.
export function makeFieldGetter(row, pfx) {
    const lc = {};
    for (const [k, v] of Object.entries(row || {})) lc[k.toLowerCase()] = v;

    const tryGet = (name) => {
        for (const candidate of [
            `${pfx}${name}`,                           // e.g., annualTotalRevenue
            name,                                      // TotalRevenue
            name.charAt(0).toLowerCase() + name.slice(1) // totalRevenue
        ]) {
            const v = lc[candidate.toLowerCase()];
            if (typeof v === "number") return v;
        }
        return undefined;
    };

    return (...names) => {
        for (const n of names) {
            const v = tryGet(n);
            if (typeof v === "number") return v;
        }
        return undefined;
    };
}

export const toISO = (d) => {
    if (!d) return null;
    if (typeof d === "number") {
        const ms = d < 1e12 ? d * 1000 : d;
        return new Date(ms).toISOString();
    }
    return new Date(d).toISOString();
};

export const prefixForType = (type) =>
    type === "quarterly" ? "quarterly" : (type === "trailing" ? "trailing" : "annual");
