// The fils conducteurs are not built yet: see ADR 0023. D03–D07 are one form in five sections,
// so they are one route with the section in its path.

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class ThreadsRoutes {
  static const list = '/pedagogy/threads';
  static String thread(String id) => '/pedagogy/threads/$id';
  static String section(String id, String section) => '/pedagogy/threads/$id/$section';
}

/// Under the Pédagogie tab: the dock stays.
final threadsRoute = GoRoute(
  path: 'threads',
  pageBuilder: (context, state) =>
      tabPage(state, ComingSoonPage(title: context.t.threads.screens.list, wireframe: 'D02', isTab: true)),
  routes: [
    GoRoute(
      path: ':id',
      pageBuilder: (context, state) =>
          tabPage(state, ComingSoonPage(title: context.t.threads.screens.thread, wireframe: 'D08')),
      routes: [
        GoRoute(
          path: ':section',
          pageBuilder: (context, state) =>
              tabPage(state, ComingSoonPage(title: context.t.threads.screens.thread, wireframe: 'D03–D07')),
        ),
      ],
    ),
  ],
);
