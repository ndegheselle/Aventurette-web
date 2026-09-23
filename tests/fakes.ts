/**
 * In-memory stand-ins for the `@chapelure/core` ports. Swap a feature's backend by mocking its
 * api module with one of these — never by reaching for the PocketBase SDK:
 *
 *     vi.mock('@features/activities/api/activities.api', () => ({
 *         activitiesApi: fakeCrud<ActivityData>([anActivity()]),
 *     }));
 */
import {
    ValidationError,
    type BaseEntity,
    type FieldErrors,
    type FilterGroup,
    type IAuthProvider,
    type IDataCrud,
    type IFileUrlResolver,
    type Paginated,
    type PaginationOptions,
} from '@chapelure/core';

export interface FakeCrud<T extends BaseEntity> extends IDataCrud<T> {
    /** Current contents, to arrange a case or assert on the result of a write. */
    items: T[];
    /** The last group handed to `filter` — what the subject actually asked for. */
    lastFilter: FilterGroup<T> | null;
    /** Make the next write fail the way a backend rejection does. */
    failNextWith(fields: FieldErrors, message?: string): void;
}

let nextId = 0;

export function fakeCrud<T extends BaseEntity>(seed: T[] = []): FakeCrud<T> {
    let pendingFailure: ValidationError | null = null;

    function raiseIfArmed() {
        if (!pendingFailure) return;
        const failure = pendingFailure;
        pendingFailure = null;
        throw failure;
    }

    const fake: FakeCrud<T> = {
        items: [...seed],
        lastFilter: null,

        failNextWith(fields, message = 'Validation failed') {
            pendingFailure = new ValidationError(fields, message);
        },

        async create(data) {
            raiseIfArmed();
            const created = { ...data, id: data.id || `fake-${++nextId}` } as T;
            fake.items.push(created);
            return created;
        },

        async update(id, data) {
            raiseIfArmed();
            const index = fake.items.findIndex(i => i.id === id);
            if (index === -1) throw new Error(`fakeCrud: no record ${id}`);
            const updated = { ...fake.items[index], ...data } as T;
            fake.items[index] = updated;
            return updated;
        },

        async remove(id) {
            raiseIfArmed();
            fake.items = fake.items.filter(i => i.id !== id);
        },

        async getById(id) {
            return fake.items.find(i => i.id === id) ?? null;
        },

        async getAll() {
            return [...fake.items];
        },

        async getList(options: PaginationOptions) {
            return page(fake.items, options);
        },

        async filter(group: FilterGroup<T>, options: PaginationOptions) {
            // Not a filter engine: the query language is the adapter's, and tested there.
            fake.lastFilter = group;
            return page(fake.items, options);
        },
    };

    return fake;
}

function page<T>(items: T[], options: PaginationOptions): Paginated<T> {
    const start = (options.page - 1) * options.perPage;
    return { items: items.slice(start, start + options.perPage), total: items.length, options };
}

export interface FakeAuth<TUser extends BaseEntity> extends IAuthProvider<TUser> {
    /** The session `refresh` revives. Null for a signed-out start. */
    session: TUser | null;
    /** Make the next login or register fail the way rejected credentials do. */
    failNextWith(fields: FieldErrors, message?: string): void;
}

export function fakeAuthProvider<TUser extends BaseEntity>(user: TUser): FakeAuth<TUser> {
    let pendingFailure: ValidationError | null = null;

    function raiseIfArmed() {
        if (!pendingFailure) return;
        const failure = pendingFailure;
        pendingFailure = null;
        throw failure;
    }

    const fake: FakeAuth<TUser> = {
        session: null,

        failNextWith(fields, message = 'Invalid credentials') {
            pendingFailure = new ValidationError(fields, message);
        },

        async login() {
            raiseIfArmed();
            fake.session = user;
            return user;
        },

        async register() {
            raiseIfArmed();
            fake.session = user;
            return user;
        },

        async refresh() {
            return fake.session;
        },

        logout() {
            fake.session = null;
        },

        async update(_id, data) {
            raiseIfArmed();
            fake.session = { ...(fake.session ?? user), ...data } as TUser;
            return fake.session;
        },
    };

    return fake;
}

/** File urls without a backend: stable, and obviously fake in a snapshot. */
export function fakeFileUrls(): IFileUrlResolver {
    return {
        getUrl: (record, filename) => `https://files.test/${record.id}/${filename}`,
    };
}
