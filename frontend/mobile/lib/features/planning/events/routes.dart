// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class EventsRoutes {
  static const tab = '/planning';
  static const create = '/events/new';
  static String event(String id) => '/events/$id';
  static String edit(String id) => '/events/$id/edit';
  static String newBlock(String id) => '/events/$id/blocks/new';
  static String coordination(String id) => '/events/$id/coordination';
}

/// The dock tab's root.
final eventsTab = GoRoute(
  path: EventsRoutes.tab,
  pageBuilder: (context, state) =>
      tabPage(state, ComingSoonPage(title: context.t.events.screens.tab, wireframe: 'B01', isTab: true)),
);

final eventsRoutes = <GoRoute>[
  fullScreenRoute(
    '/events/new',
    (context, state) => ComingSoonPage(title: context.t.events.screens.create, wireframe: 'B06'),
  ),
  fullScreenRoute(
    '/events/:id',
    (context, state) => ComingSoonPage(title: context.t.events.screens.event, wireframe: 'B07'),
  ),
  fullScreenRoute(
    '/events/:id/edit',
    (context, state) => ComingSoonPage(title: context.t.events.screens.edit, wireframe: 'B08'),
  ),
  fullScreenRoute(
    '/events/:id/blocks/new',
    (context, state) => ComingSoonPage(title: context.t.events.screens.newBlock, wireframe: 'B11'),
  ),
  fullScreenRoute(
    '/events/:id/coordination',
    (context, state) => ComingSoonPage(title: context.t.events.screens.coordination, wireframe: 'B14'),
  ),
];
