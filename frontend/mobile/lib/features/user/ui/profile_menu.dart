import 'package:ajil/features/notifications/routes.dart';
import 'package:ajil/features/structures/routes.dart';
import 'package:ajil/features/user/routes.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/menu_card.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// The avatar at the end of every tab page's header. Opens *Mon espace* (E01).
class ProfileMenuButton extends ConsumerWidget {
  const ProfileMenuButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.user.menu;
    final user = ref.watch(sessionProvider).value;

    return FButton.icon(
      variant: .secondary,
      semanticsLabel: t.open,
      onPress: () => showMenuCard(
        context,
        title: t.title,
        subtitle: (user?.name.isNotEmpty ?? false) ? user!.name : user?.email,
        builder: (menuContext) {
          // Close the menu, then open the entry: the menu is not a page to come back to.
          void open(String location) {
            Navigator.of(menuContext).pop();
            context.push(location);
          }

          return Column(
            spacing: 8,
            children: [
              LinkCard(title: t.contents, onTap: () => open(UserRoutes.contents)),
              LinkCard(title: t.preferences, onTap: () => open(UserRoutes.preferences)),
              LinkCard(title: t.account, onTap: () => open(UserRoutes.account)),
              LinkCard(title: t.settings, onTap: () => open(StructuresRoutes.settings)),
              LinkCard(title: t.notifications, onTap: () => open(NotificationsRoutes.inbox)),
            ],
          );
        },
      ),
      child: const Icon(FLucideIcons.circleUserRound),
    );
  }
}
