// The pedagogical resources are not built yet: see ADR 0023.

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

abstract final class ResourcesRoutes {
  static const list = '/pedagogy/resources';
  static String resource(String id) => '/pedagogy/resources/$id';
}

/// Under the Pédagogie tab, the list keeps the dock; a resource opens full screen on [root].
GoRoute resourcesRoute(GlobalKey<NavigatorState> root) => GoRoute(
  path: 'resources',
  pageBuilder: (context, state) =>
      tabPage(state, ComingSoonPage(title: context.t.resources.screens.list, wireframe: 'D09 · D11', isTab: true)),
  routes: [
    GoRoute(
      path: ':id',
      parentNavigatorKey: root,
      pageBuilder: (context, state) =>
          fullScreenPage(state, ComingSoonPage(title: context.t.resources.screens.resource, wireframe: 'D10')),
    ),
  ],
);
