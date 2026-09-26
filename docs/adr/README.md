# Architecture decisions

One file per decision, numbered in the order they were taken. An ADR records *why* something
is the way it is - the constraint at the time, the alternatives, and what the choice costs -
so that changing it later is a decision rather than an accident.

`ARCHITECTURE.md` describes the shape of the code as it stands today. These describe how it
got that shape. When the two disagree, `ARCHITECTURE.md` is wrong.

| # | Decision | Status |
|---|---|---|
| [0001](0001-workspace-packages-resolve-to-source.md) | Workspace packages resolve to source, with no build step | Accepted |
| [0002](0002-backend-behind-core-ports.md) | The backend sits behind ports in `@chapelure/core` | Accepted |
| [0003](0003-features-are-vertical-slices.md) | Features are vertical slices with a fixed folder shape | Accepted |
| [0004](0004-daisyui-classes-at-the-call-site.md) | daisyUI classes are written where they are used | Accepted |
| [0005](0005-icons-imported-directly.md) | Icons are imported directly from lucide | Accepted |
| [0006](0006-the-view-layer-stays-vue.md) | The view layer is Vue, and stays Vue | Accepted |
| [0007](0007-models-map-their-own-payloads.md) | Models map their own payloads, relations and files included | Accepted |
| [0008](0008-boundaries-are-enforced-by-a-script.md) | The boundaries are enforced by a script, not by convention | Accepted |
| [0009](0009-logic-lives-outside-components.md) | Logic lives in `model/` and `composables/`, not in components | Accepted |
| [0010](0010-component-tests-over-end-to-end.md) | The suite is component tests, not end-to-end | Accepted |
| [0011](0011-tests-fail-on-vue-warnings.md) | Tests fail on Vue warnings, and use the real translations | Accepted |
| [0012](0012-fakes-at-the-port-not-the-sdk.md) | Tests fake the port, never the SDK | Accepted |
| [0013](0013-specs-live-in-a-feature-tests-folder.md) | Specs live in a feature's `tests/` folder, and fewer are written | Accepted |
| [0017](0017-activity-tags-are-one-collection.md) | An activity's tags are one collection, told apart by `type` | Accepted |
| [0018](0018-code-earns-its-place.md) | Code is kept only while something uses it | Accepted |

0014 to 0016 were taken but never written down, and those numbers stay skipped rather than
being handed to something else.

## Writing a new one

Copy the shape of any of the above: **Context** (what forced a choice), **Decision** (what was
chosen, in the present tense), **Consequences** (what it buys, and what it costs).

Number it next in sequence. A decision that replaces an earlier one takes its place entirely —
its number included: the new file carries over what is still true of the old reasoning, the old
file goes, and the index only ever lists decisions that hold.
