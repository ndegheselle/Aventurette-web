import 'package:ajil/features/user/routes.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// The avatar at the end of every tab page's header. Opens *Mon espace* (E01).
class ProfileMenuButton extends StatelessWidget {
  const ProfileMenuButton({super.key});

  @override
  Widget build(BuildContext context) {
    return FButton.icon(
      variant: .ghost,
      semanticsLabel: context.t.user.menu.open,
      onPress: () => context.push(UserRoutes.mySpace),
      child: const Icon(FLucideIcons.circleUserRound),
    );
  }
}
