import 'package:ajil/features/activities/ui/activity_page.dart';
import 'package:ajil/features/activities/ui/catalogue_page.dart';
import 'package:ajil/features/activities/ui/feedback_page.dart';
import 'package:ajil/features/activities/ui/run_page.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class ActivitiesRoutes {
  static const catalogue = '/catalogue';
  static const quick = '/quick';
  static String activity(String id) => '/activities/$id';
  static String preparation(String id) => '/activities/$id/preparation';

  /// [step] is 1-based, as the user counts.
  static String run(String id, int step) => '/activities/$id/run/$step';
  static String feedback(String id) => '/activities/$id/feedback';
}

/// The Catalogue tab's root.
final catalogueTab = GoRoute(
  path: ActivitiesRoutes.catalogue,
  pageBuilder: (context, state) => tabPage(state, const CataloguePage()),
);

final activitiesRoutes = <GoRoute>[
  fullScreenRoute('/activities/:id', (context, state) => ActivityPage(activityId: state.pathParameters['id']!)),
  fullScreenRoute(
    '/activities/:id/run/:step',
    (context, state) => RunPage(activityId: state.pathParameters['id']!, stepParam: state.pathParameters['step']),
  ),
  fullScreenRoute(
    '/activities/:id/feedback',
    (context, state) => FeedbackPage(activityId: state.pathParameters['id']!),
  ),
  // Not built yet (ADR 0023).
  fullScreenRoute(
    '/activities/:id/preparation',
    (context, state) => ComingSoonPage(title: context.t.activities.screens.preparation, wireframe: 'A05'),
  ),
  fullScreenRoute(
    ActivitiesRoutes.quick,
    (context, state) => ComingSoonPage(title: context.t.activities.screens.quick, wireframe: 'A06'),
  ),
];
