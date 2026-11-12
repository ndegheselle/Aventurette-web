// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class DayTemplatesRoutes {
  static String template(String id) => '/templates/$id';
  static String edit(String id) => '/templates/$id/edit';
  static const visibility = '/settings/templates';
}

final dayTemplatesRoutes = <GoRoute>[
  fullScreenRoute(
    '/templates/:id',
    (context, state) => ComingSoonPage(title: context.t.dayTemplates.screens.template, wireframe: 'B04'),
  ),
  fullScreenRoute(
    '/templates/:id/edit',
    (context, state) => ComingSoonPage(title: context.t.dayTemplates.screens.edit, wireframe: 'B18'),
  ),
  fullScreenRoute(
    '/settings/templates',
    (context, state) => ComingSoonPage(title: context.t.dayTemplates.screens.visibility, wireframe: 'E09'),
  ),
];
