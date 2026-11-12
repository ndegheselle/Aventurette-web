/// The surfaces repeated on most screens: cards, notes, tags and the placeholders that stand in
/// for content not designed yet.
library;

import 'package:ajil/ui/theme/app_theme.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mix/mix.dart';

BoxBorderMix _border(Color color) => BoxBorderMix.all(BorderSideMix(color: color, width: AppSizes.thickness()));

BoxStyler _panelStyle() => BoxStyler()
    .color(AppColors.display.base0())
    .border(_border(AppColors.display.border0()))
    .borderRadius(BorderRadiusGeometryMix.all(AppRadii.display()))
    .padding(EdgeInsetsGeometryMix.all(AppSpaces.displayPadding()));

/// A card: the display surface everything else sits on.
class Panel extends StatelessWidget {
  const Panel({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) => Box(style: _panelStyle().width(double.infinity), child: child);
}

/// A card that opens something: a title followed by ›, and a line under it.
class LinkCard extends StatelessWidget {
  const LinkCard({super.key, required this.title, this.subtitle, this.leading, required this.onTap});

  final String title;
  final String? subtitle;
  final IconData? leading;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Panel(
          child: Row(
            spacing: context.token(AppSpaces.spacing),
            children: [
              if (leading != null) Icon(leading, color: context.muted),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: 2,
                  children: [
                    StyledText('$title  ›', style: headingText().fontSize(AppSizes.fontMd())),
                    if (subtitle != null) StyledText(subtitle!, style: captionText()),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The grey note under a screen's content: what a user should know about it.
class HintBox extends StatelessWidget {
  const HintBox(this.text, {super.key});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Box(
      style: BoxStyler()
          .width(double.infinity)
          .color(AppColors.display.base1())
          .borderRadius(BorderRadiusGeometryMix.all(AppRadii.display()))
          .padding(EdgeInsetsGeometryMix.all(AppSpaces.displayPadding())),
      child: StyledText(text, style: captionText()),
    );
  }
}

/// A small label: a duration, a place, a tag.
class Tag extends StatelessWidget {
  const Tag(this.label, {super.key});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Box(
      style: BoxStyler()
          .color(AppColors.base2())
          .borderRadius(BorderRadiusGeometryMix.all(AppRadii.pill()))
          .padding(EdgeInsetsGeometryMix.symmetric(horizontal: 10, vertical: 3)),
      child: StyledText(label, style: labelText().fontWeight(FontWeight.w500)),
    );
  }
}

/// Where a picture goes until activities have one.
class ImagePlaceholder extends StatelessWidget {
  const ImagePlaceholder({super.key, this.height = 96, this.icon = LucideIcons.image});

  final double height;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Box(
      style: BoxStyler()
          .height(height)
          .width(double.infinity)
          .color(AppColors.display.base1())
          .alignment(Alignment.center),
      child: Icon(icon, size: 28, color: context.muted),
    );
  }
}

/// Nothing to show yet: an icon and a sentence, centred.
class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.message});

  final IconData icon;
  final String message;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: [
            Icon(icon, size: 40, color: context.muted),
            StyledText(message, style: captionText().fontSize(AppSizes.fontMd()).textAlign(TextAlign.center)),
          ],
        ),
      ),
    );
  }
}
