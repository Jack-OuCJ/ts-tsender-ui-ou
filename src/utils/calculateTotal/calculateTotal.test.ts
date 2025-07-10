import { describe, it, expect } from 'vitest';
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
    it('should return 0 for an empty string', () => {
        expect(calculateTotal('')).toBe(0);
    });

    it('should return the correct sum for single numbers', () => {
        expect(calculateTotal('100')).toBe(100);
        expect(calculateTotal('200.5')).toBe(200.5);
    });

    it('should return the correct sum for comma-separated values', () => {
        expect(calculateTotal('100, 200')).toBe(300);
        expect(calculateTotal('100, 200, 300')).toBe(600);
    });

    it('should ignore invalid numbers and return the correct sum', () => {
        expect(calculateTotal('100, abc, 200')).toBe(300);
        expect(calculateTotal('50, , 75')).toBe(125);
        expect(calculateTotal('100, NaN')).toBe(100);
    });

    it('should handle whitespace correctly', () => {
        expect(calculateTotal(' 100, 200 ')).toBe(300);
        expect(calculateTotal('  50 ,  50  ,  50  ')).toBe(150);
    });
    it('should work with new line', () => {
        expect(calculateTotal(' 100asdasd\n200 ')).toBe(300);
        expect(calculateTotal(' 100\n200\n300')).toBe(600);
    });
});