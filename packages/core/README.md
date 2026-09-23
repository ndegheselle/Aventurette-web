# @chapelure/core

Contracts shared by everything else. No framework, no backend, no dependencies.

This is the layer a change of UI framework or backend should not touch, which is the only
reason it exists as a separate package. `npm run lint:arch` fails if anything here imports
`vue`, a backend SDK, or the app.

## Data

```ts
import { type IDataCrud, type PaginationOptions, type Paginated, SortDirection } from '@chapelure/core';
```

`IDataCrud<T>` is the port every repository is written against:

```ts
create(data)      update(id, data)     remove(id)
getById(id)       getAll()             getList(options)      filter(group, options)
```

`CrudFactory` is how an app gets one — an adapter supplies the implementation, the app wires
it once, and repositories only ever see the port:

```ts
type CrudFactory = <TPayload extends BaseEntity, TEntity extends BaseEntity>(
    collection: string,
    mapper: EntityMapper<TPayload, TEntity>,
) => IDataCrud<TEntity>;
```

`BaseEntity` is deliberately just `{ id: string }`. Anything richer (timestamps, collection
metadata) is backend-specific; generated app types satisfy it structurally.

## Mapping

`EntityMapper<TPayload, TEntity>` is the seam between what a backend sends and what an app
uses. A model declares one and the data layer applies it to every read and write:

```ts
interface EntityMapper<TPayload extends BaseEntity, TEntity extends BaseEntity> {
    relations: string[];
    toEntity(payload: TPayload, files: IFileUrlResolver): TEntity;
    toPayload(entity: Partial<TEntity>): Partial<TPayload>;
}
```

`relations` is what the read fetches alongside the record, so the list cannot drift from the
code reading it. `Entity<TPayload, TRelations>` writes the entity side of a payload: its
relation fields replaced by the related entities, and the backend's own fields dropped.

## Filters

A backend-neutral filter tree, which an adapter translates into whatever query language it
speaks.

```ts
import { createFilter, createGroup, createSearchFilter, FilterOperator, removeEmptyFilters } from '@chapelure/core';

const group = removeEmptyFilters(createGroup({
    filters: [
        createFilter<Activity>({ key: 'ageMin', value: 3, operator: FilterOperator.GreaterThan }),
        createSearchFilter<Activity>(search, ['name', 'summary'])!,
    ],
}));
```

## Other ports

| | |
|---|---|
| `IAuthProvider<TUser>` | `login`, `register`, `refresh`, `logout`, `update`. Keeps session handling and token storage out of the UI. |
| `IFileUrlResolver` | Turns a stored file reference into a URL, so a component never needs the backend client to show an upload. |

## Errors

`ValidationError` carries per-field codes (`{ [field]: { code } }`) normalised away from any
backend's error shape — adapters are responsible for the mapping. Plus
`NotAuthentifiedError` and `NotImplementedError`.

## Utils

`debounce`, `Deferred`, and `formatDate` / `endOfMonth` / `addDays`.
