import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/state/favorites.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/toast.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// Adds the activity to the favorites, or takes it off, and says so. The toast for a removal
/// offers to take it back, with no toast of its own: the user is undoing, not adding.
Future<void> toggleFavorite(BuildContext context, WidgetRef ref, ActivityData activity) async {
  final t = context.t.activities.favorites;
  final notifier = ref.read(favoritesProvider.notifier);

  final change = await runAction(context, () => notifier.toggle(activity));
  if (change == null || !context.mounted) return;

  if (change == FavoriteChange.added) {
    showAppToast(context, title: t.added);
    return;
  }
  showAppToast(
    context,
    title: t.removed,
    actionLabel: t.undo,
    onAction: () => runAction(context, () => notifier.add(activity)),
  );
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

    return FButton.icon(
      variant: .secondary,
      semanticsLabel: favorite ? t.saved : t.save,
      onPress: () => toggleFavorite(context, ref, activity),
      child: favorite
          ? Icon(FLucideIcons.heart, color: context.theme.colors.destructive)
          : const Icon(FLucideIcons.heart),
    );
  }
}
