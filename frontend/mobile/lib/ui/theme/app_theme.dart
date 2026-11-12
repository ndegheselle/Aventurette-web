import 'package:ajil/ui/theme/palette.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:mix/mix.dart';

/// Puts a palette's tokens in scope, for Mix styles and plain widgets alike, and sets the
/// default text and icon style from them.
class AppTheme extends StatelessWidget {
  const AppTheme({super.key, required this.palette, required this.child});

  final Palette palette;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final foreground = palette.foreground;

    return MixScope(
      colors: colorsOf(palette),
      tokens: dimensions,
      child: DefaultTextStyle(
        style: TextStyle(color: foreground, fontSize: 14, height: 1.35),
        child: IconTheme(
          data: IconThemeData(color: foreground, size: 20),
          child: child,
        ),
      ),
    );
  }
}

extension TokenLookup on BuildContext {
  /// A token's value, for a widget that takes a plain value rather than a Mix style.
  T token<T>(MixToken<T> token) => MixScope.tokenOf(token, this);

  /// Muted text and icons: the foreground at the muted opacity.
  Color get muted => token(AppColors.muted);
}
