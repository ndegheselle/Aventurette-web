import 'package:aventurette/features/user/composables/use_auth.dart';
import 'package:aventurette/features/user/model/user.dart';
import 'package:aventurette/features/user/routes.dart';

/// Who may open a route, by route name: any one of these roles. A route not listed is open to
/// any signed-in user. Add admin screens here.
const routeRoles = <String, List<Role>>{};

/// Lets login and register through; anything else needs a session, or goes to login. A route
/// whose roles the user does not hold sends them home. Returns where to redirect, else null.
Future<String?> authGuard({required String? routeName, required UseAuth auth}) async {
  if (routeName == routesNames.login || routeName == routesNames.register) return null;

  if (!auth.isLoggedIn && !await auth.refresh()) return loginPath;

  if (!auth.hasRole(routeRoles[routeName] ?? const [])) return '/';
  return null;
}
