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
| [0007](0007-relations-are-inlined-by-the-adapter.md) | Relations are inlined by the adapter | Accepted |
| [0008](0008-boundaries-are-enforced-by-a-script.md) | The boundaries are enforced by a script, not by convention | Accepted |
| [0009](0009-logic-lives-outside-components.md) | Logic lives in `model/` and `composables/`, not in components | Accepted |
| [0010](0010-component-tests-over-end-to-end.md) | The suite is component tests, not end-to-end | Accepted |
| [0011](0011-tests-fail-on-warnings-and-missing-translations.md) | Tests use the real translations and fail on warnings | Accepted |
| [0012](0012-fakes-at-the-port-not-the-sdk.md) | Tests fake the port, never the SDK | Accepted |

## Writing a new one

Copy the shape of any of the above: **Context** (what forced a choice), **Decision** (what was
chosen, in the present tense), **Consequences** (what it buys, and what it costs).

Number it next in sequence. A decision that replaces an earlier one does not edit it: mark the
old one `Superseded by NNNN` and say so in the new one, so the reasoning stays readable.
