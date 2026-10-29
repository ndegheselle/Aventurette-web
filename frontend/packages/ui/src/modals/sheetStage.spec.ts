import { describe, expect, it } from 'vitest';
import { stageAfterPull } from './sheetStage';

describe('stageAfterPull', () => {
    it.each([
        ['partial', 'up', 'full'],
        ['partial', 'down', 'closed'],
        ['full', 'down', 'partial'],
        ['full', 'up', null]
    ] as const)('from %s, pulled %s, goes to %s', (stage, way, expected) => {
        expect(stageAfterPull(stage, way)).toBe(expected);
    });
});
