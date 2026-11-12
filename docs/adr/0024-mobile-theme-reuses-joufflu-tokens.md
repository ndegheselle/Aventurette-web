# 0024. The mobile theme reuses Joufflu's token concepts, as Mix tokens

Status: Accepted.

## Context

Remix ships no theme: a component with no style renders bare. The app needs a token set, and
[Joufflu](https://github.com/ndegheselle/Joufflu/blob/main/docs/themes/tokens.md) — our WPF
library — already has one that was thought through: few colours defined, the rest derived, so
a palette is right in a light and a dark theme alike.

## Decision

`lib/ui/theme/` declares Joufflu's concepts as Mix tokens:

- **Bases** — `base0` (the page, and what an action is filled with), `base1` (a card),
  `base2` (a contrast inside one) — and `foreground`.
- **Three categories** — display, input, action — each with `base0`, `base1`, `border0`,
  `border1` and `interaction`. `border0` and `interaction` are the base mixed 10% toward the
  foreground; `border1` is `border0` mixed again.
- **Six accents** — primary, secondary, success, info, warning, danger — each defining a fill
  and a foreground, and deriving `interaction`, `soft` and `softInteraction`. Secondary's soft
  tint comes from its foreground, as in Joufflu.
- **Opacities** — `disabledOpacity` for a disabled control, `mutedOpacity` for muted text.
- **Dimensions** — a radius per category, the border thickness, the spacing, a display's
  padding, an action's padding and a control's height per size, a font size scale.

Joufflu's Light palette is the light theme; the dark one inverts the bases and the primary.

Where Mix cannot do what Joufflu does, the token is derived up front instead:

- **Muted text** is a colour token (`foreground.muted`), computed once from `mutedOpacity`: a
  Mix style cannot apply an opacity to another token.
- **The page gutter** (`space.page`, 16) is a token of its own: Joufflu uses its spacing (12)
  for page padding, which is tight on a phone.
- **Sizes are touch sizes**: heights from 28 to 48, body text 14 — Joufflu's are desktop ones.
- **A pill** has its own radius token, where Joufflu clamps a large radius to half the height.

## Consequences

- A screen asks for `AppColors.action.border0()`, never a colour: changing the palette is
  `palette.dart` alone.
- The derivations are Joufflu's, so a palette designed for one carries to the other.
- A style cannot compute with a token (`fontXl() * 0.8` reads garbage): a new value is a new
  token.
