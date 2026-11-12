// The screens of this feature are not built yet: each route shows its header and *Bientôt
// disponible*, so the app can be walked through as the wireframes draw it (ADR 0023).

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class ReviewsRoutes {
  static String review(String id) => '/reviews/$id';
  static const report = '/reports/new';
}

final reviewsRoutes = <GoRoute>[
  fullScreenRoute(
    '/reviews/:id',
    (context, state) => ComingSoonPage(title: context.t.reviews.screens.review, wireframe: 'C06'),
  ),
  fullScreenRoute(
    '/reports/new',
    (context, state) => ComingSoonPage(title: context.t.reviews.screens.report, wireframe: 'C07'),
  ),
];
