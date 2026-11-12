# 0024. The mobile app uses forui's own theme and icons

Status: Accepted.

## Context

forui ships a theme, `FThemeData`: a dozen colours (`FColors`), a typography and a style, from
which every widget derives its look. It also bundles the Lucide icons, as `FLucideIcons`.

The app first mapped [Joufflu](https://github.com/ndegheselle/Joufflu/blob/main/docs/themes/tokens.md)'s
palette onto forui's colours, and drew its icons from `lucide_icons_flutter`. Both duplicated
what forui already gives: a second palette to keep in step with forui's colour roles, and a
second copy of the same icon font.

## Decision

The theme is forui's neutral theme for touch, light or dark as the preferences say:
`FTheme.neutral.light.touch` or `FTheme.neutral.dark.touch`, set in `lib/app/app.dart`. A widget
reads its colours from `context.theme.colors` — `background`, `card`, `muted`, `border`,
`mutedForeground`, `destructive` — never a colour value.

Icons are `FLucideIcons`, from `package:forui/forui.dart`, by their real names.

What forui's theme does not hold stays in `lib/ui/theme/`:

- **The spacing** (12) and **the page gutter** (16) are constants in `tokens.dart`.
- **The text styles** (`context.titleText`, `context.captionText`…) are forui's typography with
  our weights, in `text.dart`.

A widget's look is set at the call site, as forui intends: a variant
(`FButton(variant: .outline)`), a size, or a style delta for the exception (a pill's radius).

## Consequences

- No palette of our own: a change of colours is a forui theme — another preset, or one made
  with `dart run forui theme create`.
- forui has no success, info or warning colour. The safety warning is drawn in `destructive`;
  a screen that needs the others needs a theme extension.
- One icon font, versioned with forui: an icon Lucide adds reaches the app with a forui upgrade.
