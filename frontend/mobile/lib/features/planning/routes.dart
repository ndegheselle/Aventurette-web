import 'package:ajil/features/planning/ui/planning_page.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class PlanningRoutes {
  static const tab = '/planning';
  static const create = '/events/new';
  static String event(String id) => '/events/$id';
  static String edit(String id) => '/events/$id/edit';
  static String newBlock(String id) => '/events/$id/blocks/new';
  static String coordination(String id) => '/events/$id/coordination';
}

/// The dock tab's root: a period and its events (B01).
final planningTab = GoRoute(
  path: PlanningRoutes.tab,
  pageBuilder: (context, state) => tabPage(state, const PlanningPage()),
);

final planningRoutes = <GoRoute>[
  // Not built yet (ADR 0023).
  fullScreenRoute(
    '/events/new',
    (context, state) => ComingSoonPage(title: context.t.planning.screens.create, wireframe: 'B06'),
  ),
  fullScreenRoute(
    '/events/:id',
    (context, state) => ComingSoonPage(title: context.t.planning.screens.event, wireframe: 'B07'),
  ),
  fullScreenRoute(
    '/events/:id/edit',
    (context, state) => ComingSoonPage(title: context.t.planning.screens.edit, wireframe: 'B08'),
  ),
  fullScreenRoute(
    '/events/:id/blocks/new',
    (context, state) => ComingSoonPage(title: context.t.planning.screens.newBlock, wireframe: 'B11'),
  ),
  fullScreenRoute(
    '/events/:id/coordination',
    (context, state) => ComingSoonPage(title: context.t.planning.screens.coordination, wireframe: 'B14'),
  ),
];
