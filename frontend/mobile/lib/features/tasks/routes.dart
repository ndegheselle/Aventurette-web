// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class TasksRoutes {
  static String preparation(String id) => '/events/$id/preparation';
  static String task(String id) => '/tasks/$id';
}

final tasksRoutes = <GoRoute>[
  fullScreenRoute(
    '/events/:id/preparation',
    (context, state) => ComingSoonPage(title: context.t.tasks.screens.preparation, wireframe: 'B15'),
  ),
  fullScreenRoute(
    '/tasks/:id',
    (context, state) => ComingSoonPage(title: context.t.tasks.screens.task, wireframe: 'C02'),
  ),
];
