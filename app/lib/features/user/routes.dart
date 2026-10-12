import 'package:aventurette/features/user/pages/login.page.dart';
import 'package:aventurette/features/user/pages/register.page.dart';
import 'package:aventurette/features/user/pages/settings.page.dart';
import 'package:go_router/go_router.dart';

const routesNames = (login: 'user.login', register: 'user.register', settings: 'user.settings');

const loginPath = '/user/login';

/// Reachable signed out, so they hang under the bare layout.
final publicRoutes = <RouteBase>[
  GoRoute(path: loginPath, name: routesNames.login, builder: (_, _) => const LoginPage()),
  GoRoute(path: '/user/register', name: routesNames.register, builder: (_, _) => const RegisterPage()),
];

final routes = <RouteBase>[
  GoRoute(path: '/user/settings', name: routesNames.settings, builder: (_, _) => const SettingsPage()),
];
