import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/routes.dart';
import 'package:ajil/features/activities/ui/favorite_button.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'package:remix/remix.dart';

/// "8–20 joueurs", or nothing when the activity sets no bound.
String? participantsText(Translations t, ActivityAudience audience) {
  final min = audience.participantsMin;
  final max = audience.participantsMax;
  if (min == null && max == null) return null;
  if (min == null || max == null || min == max) return t.activities.sheet.participants(count: (min ?? max)!);
  return t.activities.sheet.participantsRange(min: min, max: max);
}

/// The line under a title: "Grand jeu · 90 min · 8–20 joueurs".
String factsOf(Translations t, ActivityData activity) {
  final format = activity.classification.format;
  return [
    if (format != null) t.activities.format[format.name]!,
    t.activities.minutes(minutes: timingOf(activity).total),
    ?participantsText(t, activity.audience),
  ].join(' · ');
}

/// A card in a list: its family above a picture, its title and facts below. The whole card opens
/// the activity; the heart sits above it.
class ActivityCard extends StatelessWidget {
  const ActivityCard({super.key, required this.activity});

  final ActivityData activity;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final family = activity.classification.themes.firstOrNull?.name ?? activity.imaginary.universes.firstOrNull?.name;

    return Semantics(
      button: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => context.push(ActivitiesRoutes.activity(activity.id)),
        child: Box(
          style: BoxStyler()
              .color(AppColors.display.base0())
              .border(BoxBorderMix.all(BorderSideMix(color: AppColors.display.border0(), width: AppSizes.thickness())))
              .borderRadius(BorderRadiusGeometryMix.all(AppRadii.display()))
              .clipBehavior(Clip.antiAlias),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Stack(
                children: [
                  const ImagePlaceholder(),
                  if (family != null) Positioned(left: 12, top: 10, child: StyledText(family, style: overlineText())),
                  Positioned(right: 6, top: 6, child: FavoriteButton(activity: activity)),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  spacing: 2,
                  children: [
                    StyledText(activity.name, style: headingText()),
                    StyledText(factsOf(t, activity), style: captionText()),
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
