// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class ActivityEditorRoutes {
  static const create = '/activities/new';
  static String edit(String id) => '/activities/$id/edit';
}

final activityEditorRoutes = <GoRoute>[
  fullScreenRoute(
    '/activities/new',
    (context, state) => ComingSoonPage(title: context.t.activityEditor.screens.create, wireframe: 'A19'),
  ),
  fullScreenRoute(
    '/activities/:id/edit',
    (context, state) => ComingSoonPage(title: context.t.activityEditor.screens.edit, wireframe: 'A04'),
  ),
];
