import 'package:aventurette/features/dashboard/pages/dashboard.page.dart';
import 'package:go_router/go_router.dart';

const routesNames = (dashboard: 'dashboard');

final routes = <RouteBase>[
  GoRoute(path: '/dashboard', name: routesNames.dashboard, builder: (_, _) => const DashboardPage()),
];
