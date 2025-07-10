export function calculateTotal(amounts: string): number {
    return amounts
        .split(/[\s,]+/)
        .map(str => parseFloat(str.trim()))
        .reduce((total, amount) => total + (isNaN(amount) ? 0 : amount), 0);
}