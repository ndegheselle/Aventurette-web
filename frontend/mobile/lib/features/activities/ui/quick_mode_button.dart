import 'package:ajil/features/activities/routes.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// The ϟ in every tab page's header: opens Mode rapide (A06).
class QuickModeButton extends StatelessWidget {
  const QuickModeButton({super.key});

  @override
  Widget build(BuildContext context) => FButton.icon(
    variant: .ghost,
    semanticsLabel: context.t.activities.actions.quickMode,
    onPress: () => context.push(ActivitiesRoutes.quick),
    child: const Icon(FLucideIcons.zap),
  );
}
