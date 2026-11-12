import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:mix/mix.dart';

/// An accent as a theme defines it: the fill and what is drawn on it. The rest is derived.
class Accent {
  const Accent(this.fill, this.foreground);

  final Color fill;
  final Color foreground;
}

/// What a theme defines: the sixteen colours of Joufflu's palette. Every other colour is derived
/// from them, so a palette stays right in a light and a dark theme alike.
class Palette {
  const Palette({
    required this.base0,
    required this.base1,
    required this.base2,
    required this.foreground,
    required this.primary,
    required this.secondary,
    required this.success,
    required this.info,
    required this.warning,
    required this.danger,
    required this.brightness,
  });

  final Color base0;
  final Color base1;
  final Color base2;
  final Color foreground;
  final Accent primary;
  final Accent secondary;
  final Accent success;
  final Accent info;
  final Accent warning;
  final Accent danger;
  final Brightness brightness;

  /// Joufflu's built-in Light palette.
  static const light = Palette(
    base0: Color(0xFFFAFAFA),
    base1: Color(0xFFFFFFFF),
    base2: Color(0xFFF4F4F5),
    foreground: Color(0xFF18181B),
    primary: Accent(Color(0xFF18181B), Color(0xFFFAFAFA)),
    secondary: Accent(Color(0xFFE4E4E7), Color(0xFF27272A)),
    success: Accent(Color(0xFF00D390), Color(0xFF004C39)),
    info: Accent(Color(0xFF00BAFE), Color(0xFF042E49)),
    warning: Accent(Color(0xFFFCB700), Color(0xFF793205)),
    danger: Accent(Color(0xFFFF627D), Color(0xFF4D0218)),
    brightness: Brightness.light,
  );

  static const dark = Palette(
    base0: Color(0xFF09090B),
    base1: Color(0xFF18181B),
    base2: Color(0xFF27272A),
    foreground: Color(0xFFFAFAFA),
    primary: Accent(Color(0xFFFAFAFA), Color(0xFF18181B)),
    secondary: Accent(Color(0xFF27272A), Color(0xFFE4E4E7)),
    success: Accent(Color(0xFF00D390), Color(0xFF004C39)),
    info: Accent(Color(0xFF00BAFE), Color(0xFF042E49)),
    warning: Accent(Color(0xFFFCB700), Color(0xFF793205)),
    danger: Accent(Color(0xFFFF627D), Color(0xFF4D0218)),
    brightness: Brightness.dark,
  );
}

/// Joufflu's derivation: a colour mixed 10% toward another, so the direction is right whether
/// the theme is light or dark.
Color towards(Color color, Color target) => Color.lerp(color, target, 0.1)!;

/// The palette's colours, every derived one included, as Mix reads them.
Map<ColorToken, Color> colorsOf(Palette palette) {
  final foreground = palette.foreground;

  Map<ColorToken, Color> category(CategoryTokens tokens, Color base0, Color base1) {
    final border0 = towards(base0, foreground);
    return {
      tokens.base0: base0,
      tokens.base1: base1,
      tokens.border0: border0,
      tokens.border1: towards(border0, foreground),
      tokens.interaction: towards(base0, foreground),
    };
  }

  // Secondary's fill is pale, made to sit under its foreground: its soft tint comes from that
  // foreground instead.
  Map<ColorToken, Color> accent(AccentTokens tokens, Accent accent, {bool tintFromForeground = false}) {
    final tint = tintFromForeground ? accent.foreground : accent.fill;
    return {
      tokens.fill: accent.fill,
      tokens.foreground: accent.foreground,
      tokens.interaction: towards(accent.fill, accent.foreground),
      tokens.soft: tint.withValues(alpha: tintFromForeground ? 0.08 : 0.14),
      tokens.softInteraction: tint.withValues(alpha: tintFromForeground ? 0.14 : 0.24),
    };
  }

  return {
    AppColors.base0: palette.base0,
    AppColors.base1: palette.base1,
    AppColors.base2: palette.base2,
    AppColors.foreground: foreground,
    AppColors.muted: foreground.withValues(alpha: mutedOpacity),
    ...category(AppColors.display, palette.base1, palette.base2),
    ...category(AppColors.input, palette.base1, palette.base2),
    ...category(AppColors.action, palette.base0, palette.base0),
    ...accent(AppColors.primary, palette.primary),
    ...accent(AppColors.secondary, palette.secondary, tintFromForeground: true),
    ...accent(AppColors.success, palette.success),
    ...accent(AppColors.info, palette.info),
    ...accent(AppColors.warning, palette.warning),
    ...accent(AppColors.danger, palette.danger),
  };
}

const mutedOpacity = 0.65;

/// The metrics. Joufflu's concepts with touch values: heights and fonts sized for a phone.
final dimensions = <MixToken<Object>, Object>{
  AppRadii.display: Radius.circular(12),
  AppRadii.input: Radius.circular(10),
  AppRadii.action: Radius.circular(10),
  AppRadii.pill: Radius.circular(999),
  AppSpaces.spacing: 12.0,
  AppSpaces.page: 16.0,
  AppSpaces.displayPadding: 12.0,
  AppSpaces.displayPaddingSm: 4.0,
  AppSpaces.actionPaddingSm: 12.0,
  AppSpaces.actionPaddingMd: 16.0,
  AppSpaces.actionPaddingLg: 20.0,
  AppSpaces.inputPadding: 12.0,
  AppSizes.heightXs: 28.0,
  AppSizes.heightSm: 32.0,
  AppSizes.heightMd: 40.0,
  AppSizes.heightLg: 48.0,
  AppSizes.fontXs: 11.0,
  AppSizes.fontSm: 12.0,
  AppSizes.fontMd: 14.0,
  AppSizes.fontLg: 16.0,
  AppSizes.fontXl: 24.0,
  AppSizes.thickness: 1.0,
  AppSizes.disabledOpacity: 0.5,
  AppSizes.mutedOpacity: mutedOpacity,
};
