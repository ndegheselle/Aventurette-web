import routes from '@features/admin/catalogue-authoring/routes';
import { Role } from '@features/user/models/user';
import { describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';

describe('catalogue-authoring routes', () => {
    // The guard only checks what `meta.roles` asks for: a route without it is open to any
    // signed-in user.
    it('are all admin-only, by their own meta or a parent\'s', () => {
        const router = createRouter({ history: createMemoryHistory(), routes });

        const paths = router.getRoutes().map((route) => route.path);
        const openPaths = paths.filter((path) => !router.resolve(path).meta.roles?.includes(Role.ADMIN));

        expect(paths).not.toEqual([]);
        expect(openPaths).toEqual([]);
    });
});
