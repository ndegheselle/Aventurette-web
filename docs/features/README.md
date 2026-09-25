# Features

One document per feature in `front/src/features/`. Each says what the feature does, the routes
it owns, the shape of its data, the rules that hold, and what is not finished.

| Feature | What it is |
|---|---|
| [activities](activities.md) | Browsing and filtering the public activity catalogue |
| [activities-edit](activities-edit.md) | Authoring: the author's own activities, and the form behind them |
| [auth](auth.md) | Signing in, signing up, and guarding the rest of the app |
| [dashboard](dashboard.md) | The signed-in user's landing page — empty for now |
| [users](users.md) | The account: profile type and children |
| home | A single placeholder page. Not routed — `/` redirects to the activity list. |

A feature's own layout, and the rules every feature follows, are in
[ADR 0003](../adr/0003-features-are-vertical-slices.md). Where behaviour lives within one is
[ADR 0009](../adr/0009-logic-lives-outside-components.md).

## Reading these

Each document has a **Rules that hold** section. Those are the statements the test suite
asserts, with the spec that asserts them named. They are the contract: change one and a test
should fail. If you change one deliberately, change the test and the line here in the same
commit.
