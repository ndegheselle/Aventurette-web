import { describe, expect, it } from 'vitest';
import { addDays, endOfMonth, formatDate } from './date';

describe('formatDate', () => {
    it('renders dd/mm/yyyy, zero-padded', () => {
        expect(formatDate(new Date(2024, 0, 5))).toBe('05/01/2024');
    });

    it('accepts the ISO strings the backend sends', () => {
        expect(formatDate('2024-11-30T10:00:00Z')).toBe('30/11/2024');
    });

    it('renders an em dash rather than "Invalid Date" when there is no date', () => {
        expect(formatDate(null)).toBe('—');
        expect(formatDate(undefined)).toBe('—');
        expect(formatDate('')).toBe('—');
    });
});

describe('endOfMonth', () => {
    it('finds the last day of the month', () => {
        expect(endOfMonth(new Date(2024, 0, 15)).getDate()).toBe(31);
        expect(endOfMonth(new Date(2024, 3, 1)).getDate()).toBe(30);
    });

    it('knows February in a leap year', () => {
        expect(endOfMonth(new Date(2024, 1, 1)).getDate()).toBe(29);
        expect(endOfMonth(new Date(2023, 1, 1)).getDate()).toBe(28);
    });
});

describe('addDays', () => {
    it('rolls over month and year boundaries', () => {
        expect(addDays(new Date(2024, 11, 30), 3)).toEqual(new Date(2025, 0, 2));
    });

    it('goes backwards for a negative count', () => {
        expect(addDays(new Date(2024, 0, 2), -3)).toEqual(new Date(2023, 11, 30));
    });

    it('leaves its argument alone', () => {
        const original = new Date(2024, 0, 1);
        addDays(original, 10);
        expect(original).toEqual(new Date(2024, 0, 1));
    });
});
