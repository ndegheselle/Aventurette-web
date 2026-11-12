// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class SharingRoutes {
  static const dossier = '/share/dossier';
  static const preview = '/share/dossier/preview';
  static const link = '/share/link';
}

final sharingRoutes = <GoRoute>[
  fullScreenRoute(
    '/share/dossier',
    (context, state) => ComingSoonPage(title: context.t.sharing.screens.dossier, wireframe: 'A11'),
  ),
  fullScreenRoute(
    '/share/dossier/preview',
    (context, state) => ComingSoonPage(title: context.t.sharing.screens.preview, wireframe: 'A12'),
  ),
  fullScreenRoute(
    '/share/link',
    (context, state) => ComingSoonPage(title: context.t.sharing.screens.link, wireframe: 'A13'),
  ),
];
