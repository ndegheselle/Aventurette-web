import 'package:ajil/features/activities/routes.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

/// The ϟ in every tab page's header: opens Mode rapide (A06).
class QuickModeButton extends StatelessWidget {
  const QuickModeButton({super.key});

  @override
  Widget build(BuildContext context) => RemixIconButton(
    icon: LucideIcons.zap,
    semanticLabel: context.t.activities.actions.quickMode,
    style: iconButtonStyle(),
    onPressed: () => context.push(ActivitiesRoutes.quick),
  );
}
