

/**
 * 
 * @param timeInMs 
 * @param order 
 */
export function formatISODateFromMs(timeInMs: number, order: String) {
    const d: Date = new Date(timeInMs);
    return d.toISOString()
}