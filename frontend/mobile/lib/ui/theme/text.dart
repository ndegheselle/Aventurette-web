/// The text styles the screens use, from the font size scale. Render with `StyledText`.
library;

import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:mix/mix.dart';

/// A tab page's title, and a full-screen view's subject ("Préparation", "Sortie SG").
TextStyler titleText() =>
    TextStyler().fontSize(AppSizes.fontXl()).fontWeight(FontWeight.w700).color(AppColors.foreground());

/// A header's title, a card's title.
TextStyler headingText() =>
    TextStyler().fontSize(AppSizes.fontLg()).fontWeight(FontWeight.w700).color(AppColors.foreground());

TextStyler bodyText() => TextStyler().fontSize(AppSizes.fontMd()).color(AppColors.foreground());

/// A field's label, a facts line.
TextStyler labelText() =>
    TextStyler().fontSize(AppSizes.fontSm()).fontWeight(FontWeight.w600).color(AppColors.foreground());

/// Hints, captions, a card's second line.
TextStyler captionText() => TextStyler().fontSize(AppSizes.fontSm()).color(AppColors.muted());

/// The small capitals above a card's title ("AVENTURE", "ÉTAPE 2 / 5").
TextStyler overlineText() => TextStyler()
    .fontSize(AppSizes.fontXs())
    .fontWeight(FontWeight.w700)
    .letterSpacing(0.6)
    .uppercase()
    .color(AppColors.muted());
