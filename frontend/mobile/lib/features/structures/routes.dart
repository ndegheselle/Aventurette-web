// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class StructuresRoutes {
  static const settings = '/settings';
  static const structures = '/settings/structures';
  static const permissions = '/settings/permissions';
}

final structuresRoutes = <GoRoute>[
  fullScreenRoute(
    '/settings',
    (context, state) => ComingSoonPage(title: context.t.structures.screens.settings, wireframe: 'E05'),
  ),
  fullScreenRoute(
    '/settings/structures',
    (context, state) => ComingSoonPage(title: context.t.structures.screens.structures, wireframe: 'E06'),
  ),
  fullScreenRoute(
    '/settings/permissions',
    (context, state) => ComingSoonPage(title: context.t.structures.screens.permissions, wireframe: 'E07'),
  ),
];
