/**
 * The reservation window, shared by the server that enforces it and the browser
 * that counts it down. Deliberately free of any database import so it can be
 * pulled into client bundles — the sweep that acts on these values lives in
 * `./group`, which is server-only.
 */

/**
 * How long a placed order holds its stock and its rider while the payment is
 * still outstanding. The shopper can return to My Orders and finish paying any
 * time inside this window; once it closes the chocolate goes back on the shelf.
 */
export const RESERVATION_MINUTES = 5;

const RESERVATION_MS = RESERVATION_MINUTES * 60 * 1000;

export const reservationDeadline = (from: Date = new Date()) =>
    new Date(from.getTime() + RESERVATION_MS);

/** Milliseconds left on a hold, floored at zero. A missing deadline reads as 0. */
export function millisRemaining(reservedUntil: string | Date | null | undefined): number {
    if (!reservedUntil) return 0;
    const deadline = reservedUntil instanceof Date ? reservedUntil : new Date(reservedUntil);
    const left = deadline.getTime() - Date.now();
    return Number.isFinite(left) ? Math.max(0, left) : 0;
}

/** `4:07` — the shape a countdown wants. */
export function formatCountdown(millis: number): string {
    const total = Math.ceil(millis / 1000);
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
