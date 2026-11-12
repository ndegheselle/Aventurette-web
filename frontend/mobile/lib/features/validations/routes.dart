// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class ValidationsRoutes {
  static String event(String eventId) => '/validations/$eventId';
  static String adjust(String eventId, String blockId) => '/validations/$eventId/adjust/$blockId';
}

final validationsRoutes = <GoRoute>[
  fullScreenRoute(
    '/validations/:eventId',
    (context, state) => ComingSoonPage(title: context.t.validations.screens.event, wireframe: 'C03'),
  ),
  fullScreenRoute(
    '/validations/:eventId/adjust/:blockId',
    (context, state) => ComingSoonPage(title: context.t.validations.screens.adjust, wireframe: 'C08'),
  ),
];
