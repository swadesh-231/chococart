/** Postgres SQLSTATE for unique_violation. */
const UNIQUE_VIOLATION = '23505';

function pgErrorCode(err: unknown): string | undefined {
    // drizzle wraps driver errors in DrizzleQueryError and puts the original
    // postgres error on `cause`, so the code is one level down.
    let current = err;

    for (let depth = 0; current && depth < 5; depth++) {
        if (typeof current === 'object' && 'code' in current) {
            const code = (current as { code?: unknown }).code;
            if (typeof code === 'string') return code;
        }
        current = (current as { cause?: unknown }).cause;
    }

    return undefined;
}

export function isUniqueViolation(err: unknown): boolean {
    return pgErrorCode(err) === UNIQUE_VIOLATION;
}
