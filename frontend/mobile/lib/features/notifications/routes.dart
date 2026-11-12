// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class NotificationsRoutes {
  static const preferences = '/settings/notifications';
  static const inbox = '/notifications';
}

final notificationsRoutes = <GoRoute>[
  fullScreenRoute(
    '/settings/notifications',
    (context, state) => ComingSoonPage(title: context.t.notifications.screens.preferences, wireframe: 'E08'),
  ),
  fullScreenRoute(
    '/notifications',
    (context, state) => ComingSoonPage(title: context.t.notifications.screens.inbox, wireframe: 'E10'),
  ),
];
