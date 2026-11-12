/// The text styles the screens use, from forui's touch typography: `Text(title, style: context.headingText)`.
library;

import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

extension AppText on BuildContext {
  FTypeface get _body => theme.typography.body;
  Color get _foreground => theme.colors.foreground;
  Color get _muted => theme.colors.mutedForeground;

  /// A tab page's title, and a full-screen view's subject ("Préparation", "Sortie SG").
  TextStyle get titleText => _body.xl.copyWith(fontWeight: FontWeight.w700, color: _foreground);

  /// A header's title, a card's title.
  TextStyle get headingText => _body.sm.copyWith(fontWeight: FontWeight.w700, color: _foreground);

  TextStyle get bodyText => _body.xs.copyWith(color: _foreground);

  /// A field's label, a facts line.
  TextStyle get labelText => _body.xs2.copyWith(fontWeight: FontWeight.w600, color: _foreground);

  /// Hints, captions, a card's second line.
  TextStyle get captionText => _body.xs2.copyWith(color: _muted);

  /// The small capitals above a card's title ("AVENTURE", "ÉTAPE 2 / 5"). The text is
  /// upper-cased by the caller: a style cannot.
  TextStyle get overlineText =>
      _body.xs3.copyWith(fontWeight: FontWeight.w700, letterSpacing: 0.6, color: _muted);
}
