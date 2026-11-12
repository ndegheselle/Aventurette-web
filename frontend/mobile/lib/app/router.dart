import 'package:ajil/app/shell.dart';
import 'package:ajil/features/activities/routes.dart';
import 'package:ajil/features/activity_editor/routes.dart';
import 'package:ajil/features/create/routes.dart';
import 'package:ajil/features/follow_up/routes.dart';
import 'package:ajil/features/inventory/routes.dart';
import 'package:ajil/features/notifications/routes.dart';
import 'package:ajil/features/pedagogy/home/routes.dart';
import 'package:ajil/features/planning/day_templates/routes.dart';
import 'package:ajil/features/planning/events/routes.dart';
import 'package:ajil/features/reviews/routes.dart';
import 'package:ajil/features/sharing/routes.dart';
import 'package:ajil/features/structures/routes.dart';
import 'package:ajil/features/tasks/routes.dart';
import 'package:ajil/features/user/guard.dart';
import 'package:ajil/features/user/routes.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:ajil/features/validations/routes.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

/// Shown while the session is read, at start.
const _waiting = '/';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

/// Every route of the app. The five dock tabs keep their own history in a shell; everything
/// else is pushed over the dock. A private route needs a session: see [redirectFor].
final routerProvider = Provider<GoRouter>((ref) {
  final session = ValueNotifier(ref.read(sessionProvider));
  ref.listen(sessionProvider, (previous, next) => session.value = next);
  ref.onDispose(session.dispose);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: _waiting,
    refreshListenable: session,
    redirect: (context, state) => redirectFor(
      loading: !session.value.hasValue,
      user: session.value.value,
      location: state.matchedLocation,
      waiting: _waiting,
      home: ActivitiesRoutes.catalogue,
    ),
    routes: [
      GoRoute(
        path: _waiting,
        pageBuilder: (context, state) => tabPage(state, const AppPage(header: SizedBox.shrink(), body: LoadingView())),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, shell) => AppShell(shell: shell),
        branches: [
          StatefulShellBranch(routes: [catalogueTab]),
          StatefulShellBranch(routes: [eventsTab]),
          StatefulShellBranch(routes: [createTab]),
          StatefulShellBranch(routes: [followUpTab]),
          StatefulShellBranch(routes: [pedagogyTab(_rootNavigatorKey)]),
        ],
      ),
      ...userRoutes,
      // Before the activities: `/activities/new` is not an activity's id.
      ...activityEditorRoutes,
      ...activitiesRoutes,
      ...eventsRoutes,
      ...dayTemplatesRoutes,
      ...tasksRoutes,
      ...inventoryRoutes,
      ...validationsRoutes,
      ...reviewsRoutes,
      ...sharingRoutes,
      ...structuresRoutes,
      ...notificationsRoutes,
      ...createRoutes,
      ...followUpRoutes,
    ],
  );
});
