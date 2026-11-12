// Pédagogie (D01) is not built yet: see ADR 0023. Its fils conducteurs and resources hang under
// it, so the dock stays while the user moves between them, as the wireframes draw it.

import 'package:ajil/features/pedagogy/resources/routes.dart';
import 'package:ajil/features/pedagogy/threads/routes.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

abstract final class PedagogyRoutes {
  static const tab = '/pedagogy';
}

/// The dock tab's root. [root] is the app's navigator, for the views that leave the dock.
GoRoute pedagogyTab(GlobalKey<NavigatorState> root) => GoRoute(
  path: PedagogyRoutes.tab,
  pageBuilder: (context, state) =>
      tabPage(state, ComingSoonPage(title: context.t.pedagogy.screens.tab, wireframe: 'D01', isTab: true)),
  routes: [threadsRoute, resourcesRoute(root)],
);
