import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/state/favorites.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/toast.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

/// Adds the activity to the favorites, or takes it off, and says so. The toast for a removal
/// offers to take it back, with no toast of its own: the user is undoing, not adding.
Future<void> toggleFavorite(BuildContext context, WidgetRef ref, ActivityData activity) async {
  final t = context.t.activities.favorites;
  final notifier = ref.read(favoritesProvider.notifier);

  final change = await runAction(context, () => notifier.toggle(activity));
  if (change == null || !context.mounted) return;

  if (change == FavoriteChange.added) {
    showToast(context, t.added);
    return;
  }
  showToast(context, t.removed, actionLabel: t.undo, onAction: () => runAction(context, () => notifier.add(activity)));
}

/// The heart on a card.
class FavoriteButton extends ConsumerWidget {
  const FavoriteButton({super.key, required this.activity});

  final ActivityData activity;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.watch(favoritesProvider);
    final favorite = ref.read(favoritesProvider.notifier).isFavorite(activity.id);
    final t = context.t.activities.actions;

    return RemixIconButton(
      icon: LucideIcons.heart,
      semanticLabel: favorite ? t.saved : t.save,
      style: favorite
          ? iconButtonStyle(variant: ButtonVariant.danger).iconFill(1).iconColor(AppColors.danger.fill())
          : iconButtonStyle(),
      onPressed: () => toggleFavorite(context, ref, activity),
    );
  }
}
