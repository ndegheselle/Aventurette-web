# 0017 — Models map their own payloads

**Status:** Accepted — supersedes [0007](0007-relations-are-inlined-by-the-adapter.md)

## Context

[0007](0007-relations-are-inlined-by-the-adapter.md) had the adapter fold PocketBase's `expand`
into the record generically, and models declare the result with `Expanded<Response, { … }>`.
That kept `expand` out of the app, but it left the two shapes — what the backend sends and what
the app uses — as one type with a wrapper around it:

- A model's type had to list the same relations as the `relations` argument its api module
  passed, and nothing checked the two against each other.
- An unexpanded relation kept its ids while the type promised records, so the type could lie in
  a way no one saw until a template rendered ids.
- Files had no place in it at all. A resource's `file` was a name, and every call site that
  wanted to show it reached for `resourcesApi.getFileUrl(resource)` first.

## Decision

Each model declares an `EntityMapper<TPayload, TEntity>`: the payload type it reads, the entity
type the app uses, the relations it needs fetched, and the two functions between them.

```ts
export const stepMapper: EntityMapper<ActivityStepPayload, ActivityStepData> = {
    relations: ["materials", "resources"],
    toEntity: ({ expand, ...step }, files) => ({ … }),
    toPayload: ({ materials, resources, ...step }) => ({ … }),
};
```

`toEntity` inlines the relations and resolves stored file names to urls; `toPayload` turns the
related entities back into ids. The adapter applies the mapper on every read and every write,
and expands exactly `mapper.relations`. A model nests its children's mappers — an activity's
calls the step's, which calls the resource's.

The `IFileUrlResolver` is handed to `toEntity` rather than imported, so a model stays free of
the backend.

## Consequences

- One shape per side, and one place they meet. `ActivityPayload` is what the wire carries;
  `ActivityData` is what the app binds to; nothing in between holds both.
- The relations list sits in the mapper that reads them, so it cannot drift from the fetch.
- A relation the request did not expand now maps to `[]` rather than to ids the type denies.
- A file is a url by the time a component sees it — no resolver call at the call site.
- The cost is boilerplate: a mapper per model, even where it only drops `expand`. That is the
  price of the payload type being honest about the backend and the entity type being honest
  about the app.
- Reads and writes are still not symmetric: a relation field carries whole entities, and saving
  the parent persists their ids. Editing a step is still a write to the steps collection.
