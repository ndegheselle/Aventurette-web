import { getMessage } from '@/app/i18n';
import { describe, expect, it } from 'vitest';

// A referential row carries its own translations, so reading one is a lookup with a fallback —
// the only decision in the model.

describe('wordingIn', () => {
    it('reads the locale asked for', () => {
        expect(getMessage({ fr: 'art', en: 'art' }, 'en')).toBe('art');
    });

    it('falls back to French for a locale the row was never translated into', () => {
        expect(getMessage({ fr: 'ingénierie' }, 'en')).toBe('ingénierie');
    });

    it('reads as nothing rather than "undefined" when the row has no wording at all', () => {
        // A badge with no text is a smaller lie than the string "undefined".
        expect(getMessage({}, 'en')).toBe('');
        expect(getMessage(null, 'en')).toBe('');
        expect(getMessage(undefined, 'en')).toBe('');
    });
});
