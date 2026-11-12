/// The design tokens, as Mix tokens. The concepts are Joufflu's (see `docs/mobile/theme.md`):
/// three bases, three control categories each with the same four colours, six accents each with
/// the same five, two opacities, and dimensions per category and per size.
///
/// A style refers to a token, never to a value: `.color(AppColors.primary.fill())`. The values
/// are in `palette.dart`, and [AppTheme] puts them in scope.
library;

import 'package:mix/mix.dart';

/// Six semantic families sharing one shape: the fill, what is drawn on it, and three colours
/// derived from those two.
final class AccentTokens {
  AccentTokens(String name)
    : fill = ColorToken(name),
      foreground = ColorToken('$name.foreground'),
      interaction = ColorToken('$name.interaction'),
      soft = ColorToken('$name.soft'),
      softInteraction = ColorToken('$name.softInteraction');

  /// The fill: a filled button, a selected tab or chip.
  final ColorToken fill;

  /// Text and icons drawn on the fill.
  final ColorToken foreground;

  /// The fill while pressed or hovered.
  final ColorToken interaction;

  /// The fill at low opacity: a soft button, a badge. Drawn with the fill as text.
  final ColorToken soft;
  final ColorToken softInteraction;
}

/// One control category: its background, its two borders and its interacted background.
final class CategoryTokens {
  CategoryTokens(String name)
    : base0 = ColorToken('$name.base0'),
      base1 = ColorToken('$name.base1'),
      border0 = ColorToken('$name.border0'),
      border1 = ColorToken('$name.border1'),
      interaction = ColorToken('$name.interaction');

  /// The background.
  final ColorToken base0;

  /// A contrast inside it (a header, a hint). Only display and input have their own.
  final ColorToken base1;

  /// The border, and what sits on the base (a track, a tag).
  final ColorToken border0;

  /// A border that must stand out from [border0], and the border of an interacted control.
  final ColorToken border1;

  /// The background of an interacted control.
  final ColorToken interaction;
}

abstract final class AppColors {
  /// The page, and what an action is filled with.
  static const base0 = ColorToken('base0');

  /// A card, and the base of a display and of an input.
  static const base1 = ColorToken('base1');

  /// A contrast inside a card.
  static const base2 = ColorToken('base2');

  /// Default text and icon colour, on any base.
  static const foreground = ColorToken('foreground');

  /// Muted text: placeholders, hints, captions. Joufflu dims the foreground by `mutedOpacity`
  /// rather than giving it a colour; a token style cannot apply an opacity to another token, so
  /// the dimmed colour is derived once, here.
  static const muted = ColorToken('foreground.muted');

  /// Cards, sheets, the dock, menus, lists: what shows things.
  static final display = CategoryTokens('display');

  /// Text fields, checkboxes, sliders: what takes input.
  static final input = CategoryTokens('input');

  /// Buttons, chips, tabs: what acts.
  static final action = CategoryTokens('action');

  static final primary = AccentTokens('primary');
  static final secondary = AccentTokens('secondary');
  static final success = AccentTokens('success');
  static final info = AccentTokens('info');
  static final warning = AccentTokens('warning');
  static final danger = AccentTokens('danger');
}

abstract final class AppRadii {
  static const display = RadiusToken('radius.display');
  static const input = RadiusToken('radius.input');
  static const action = RadiusToken('radius.action');

  /// Chips and pill tabs: half their height, whatever it is.
  static const pill = RadiusToken('radius.pill');
}

abstract final class AppSpaces {
  /// The gap between sibling elements.
  static const spacing = SpaceToken('space.spacing');

  /// The page's side gutter. Joufflu uses [spacing] for it; a phone needs a little more.
  static const page = SpaceToken('space.page');

  /// Inside a display (a card, a sheet).
  static const displayPadding = SpaceToken('space.displayPadding');

  /// Inside a compact display (a badge, a menu, a toast).
  static const displayPaddingSm = SpaceToken('space.displayPaddingSm');

  /// The horizontal padding of an action or an input, per size. The height comes from the size.
  static const actionPaddingSm = SpaceToken('space.actionPadding.sm');
  static const actionPaddingMd = SpaceToken('space.actionPadding.md');
  static const actionPaddingLg = SpaceToken('space.actionPadding.lg');
  static const inputPadding = SpaceToken('space.inputPadding');
}

abstract final class AppSizes {
  /// Single-line control heights. Touch targets: every one is above Joufflu's desktop values.
  static const heightXs = DoubleToken('height.xs');
  static const heightSm = DoubleToken('height.sm');
  static const heightMd = DoubleToken('height.md');
  static const heightLg = DoubleToken('height.lg');

  static const fontXs = DoubleToken('font.xs');
  static const fontSm = DoubleToken('font.sm');
  static const fontMd = DoubleToken('font.md');
  static const fontLg = DoubleToken('font.lg');
  static const fontXl = DoubleToken('font.xl');

  /// The border of every category.
  static const thickness = DoubleToken('thickness');

  /// Applied to a whole control while disabled.
  static const disabledOpacity = DoubleToken('opacity.disabled');

  /// Applied to muted text: hints, captions, descriptions.
  static const mutedOpacity = DoubleToken('opacity.muted');
}
