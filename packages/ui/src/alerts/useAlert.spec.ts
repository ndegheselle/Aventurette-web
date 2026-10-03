import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EnumAlertType, useAlert } from './useAlert';

describe('useAlert', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useAlert().alerts.value = [];
    });
    afterEach(() => vi.useRealTimers());

    it('pushes a message of the right type', () => {
        const alert = useAlert();

        alert.success('Saved');

        expect(alert.alerts.value).toEqual([
            expect.objectContaining({ message: 'Saved', type: EnumAlertType.Success }),
        ]);
    });

    it('is shared, so an alert raised in a composable shows in the layout\'s container', () => {
        useAlert().error('Boom');

        expect(useAlert().alerts.value.map(a => a.message)).toEqual(['Boom']);
    });

    it('gives alerts distinct ids even within the same millisecond', () => {
        const alert = useAlert();

        alert.success('one');
        alert.success('two');

        const [first, second] = alert.alerts.value;
        expect(first!.id).not.toBe(second!.id);
    });

    it('dismisses only the alert asked for', () => {
        const alert = useAlert();
        alert.success('one');
        alert.success('two');

        alert.close(alert.alerts.value[0]!.id);

        expect(alert.alerts.value.map(a => a.message)).toEqual(['two']);
    });

    it('dismisses itself after a while', () => {
        const alert = useAlert();

        alert.success('temporary');
        expect(alert.alerts.value).toHaveLength(1);

        vi.runAllTimers();
        expect(alert.alerts.value).toHaveLength(0);
    });

    it('auto-dismiss removes the right one when an alert was closed by hand first', () => {
        const alert = useAlert();
        alert.success('one');
        alert.success('two');

        alert.close(alert.alerts.value[0]!.id);
        vi.runAllTimers();

        expect(alert.alerts.value).toHaveLength(0);
    });
});
