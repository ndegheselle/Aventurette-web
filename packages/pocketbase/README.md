# @chapelure/pocketbase

PocketBase adapter for the `@chapelure/core` ports. The only package allowed to import the
`pocketbase` SDK.

Peer dependency: `pocketbase`.

## Wiring

A consuming app should import this from exactly one file, so that swapping backends means
rewriting that file and this package. In this repo that file is `front/src/backend/index.ts`:

```ts
import type { CrudFactory, IFileUrlResolver } from '@chapelure/core';
import {
    createPocketBaseAuth, createPocketBaseCached, createPocketBaseCrud,
    createPocketBaseFileUrls, initPocketBase,
} from '@chapelure/pocketbase';

const client = initPocketBase(import.meta.env.VITE_API_URL);

export const crud: CrudFactory = (collection, relations) => createPocketBaseCrud(client, collection, relations);
export const cachedCrud: CrudFactory = (collection, relations) => createPocketBaseCached(client, collection, relations);
export const fileUrls: IFileUrlResolver = createPocketBaseFileUrls(client);
```

Everything downstream depends on the core ports only.

## What each piece does

| | |
|---|---|
| `initPocketBase(url)` / `getPocketBase()` | Creates and returns the shared client. Idempotent. |
| `createPocketBaseCrud(client, collection, relations?)` | `IDataCrud`. `relations` becomes PocketBase's `expand`. Returns **only** the port — the `RecordService` and client stay closed over, so callers cannot reach around the seam. |
| `createPocketBaseCached(client, collection, relations?)` | Same contract, but fetches the collection once and serves reads from memory. For small reference collections. Create it at module scope so the cache is shared. `filter()` always goes to the server. |
| `createPocketBaseAuth(client, collection)` | `IAuthProvider`. Wraps `authWithPassword`, `authRefresh`, `requestVerification` and the auth store. |
| `createPocketBaseFileUrls(client)` | `IFileUrlResolver`, over `pb.files.getURL`. |
| `filterGroupToPocketBase(group)` | Core's filter tree → a PocketBase filter string. |
| `toValidationError(error)` / `mapErrors(fn)` | Maps a PocketBase `ClientResponseError` to core's `ValidationError`. Returns `undefined` for anything that is not a response error (network failures, aborts) so those are rethrown untouched rather than mislabelled. |

## Generated types

`pocketbase-typegen` output describes an app's own schema, so it belongs to the app, not
here. The adapter is generic over the entity type instead.
