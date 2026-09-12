import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('runs once, after the delay, for a burst of calls', () => {
        const spy = vi.fn();
        const debounced = debounce(spy, 300);

        debounced('a');
        debounced('b');
        debounced('c');
        expect(spy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(300);
        expect(spy).toHaveBeenCalledExactlyOnceWith('c');
    });

    it('restarts the delay on every call, so typing never fires mid-word', () => {
        const spy = vi.fn();
        const debounced = debounce(spy, 300);

        debounced('a');
        vi.advanceTimersByTime(299);
        debounced('ab');
        vi.advanceTimersByTime(299);
        expect(spy).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(spy).toHaveBeenCalledExactlyOnceWith('ab');
    });

    it('fires again for a call made after the delay has elapsed', () => {
        const spy = vi.fn();
        const debounced = debounce(spy, 300);

        debounced('first');
        vi.advanceTimersByTime(300);
        debounced('second');
        vi.advanceTimersByTime(300);

        expect(spy).toHaveBeenCalledTimes(2);
    });
});
