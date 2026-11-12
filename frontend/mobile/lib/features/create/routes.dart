// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class CreateRoutes {
  static const tab = '/create';
}

/// The dock tab's root.
final createTab = GoRoute(
  path: CreateRoutes.tab,
  pageBuilder: (context, state) =>
      tabPage(state, ComingSoonPage(title: context.t.create.screens.tab, wireframe: 'B05', isTab: true)),
);

final createRoutes = <GoRoute>[];
