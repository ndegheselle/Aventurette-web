import 'package:aventurette/app/layouts/empty.layout.dart';
import 'package:aventurette/app/layouts/main.layout.dart';
import 'package:aventurette/features/activities/routes.dart' as activities;
import 'package:aventurette/features/dashboard/routes.dart' as dashboard;
import 'package:aventurette/features/user/composables/use_auth.dart';
import 'package:aventurette/features/user/guard.dart';
import 'package:aventurette/features/user/routes.dart' as user;
import 'package:go_router/go_router.dart';

/// Each feature owns its route module; the app only picks the layout they hang under.
GoRouter createRouter() {
  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) => authGuard(routeName: state.topRoute?.name, auth: UseAuth.shared),
    routes: [
      // XXX : until the dashboard has something to show.
      GoRoute(path: '/', redirect: (_, _) => '/activities'),
      ShellRoute(
        builder: (context, state, child) => MainLayout(state: state, child: child),
        routes: [...dashboard.routes, ...activities.routes, ...user.routes],
      ),
      ShellRoute(
        builder: (context, state, child) => EmptyLayout(child: child),
        routes: user.publicRoutes,
      ),
    ],
  );
}
