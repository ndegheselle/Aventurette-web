import 'package:ajil/features/user/ui/login/page.dart';
import 'package:ajil/features/user/ui/me/page.dart';
import 'package:ajil/features/user/ui/me/prefs/page.dart';
import 'package:ajil/features/user/ui/onboarding_page.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/coming_soon_page.dart';
import 'package:ajil/ui/shell/pages.dart';
import 'package:go_router/go_router.dart';

abstract final class UserRoutes {
  static const login = '/login';
  static const onboarding = '/onboarding';
  static const mySpace = '/me';
  static const contents = '/me/contents';
  static const preferences = '/me/preferences';
  static const account = '/me/account';

  /// Reachable signed out.
  static const public = {login};
}

final userRoutes = <GoRoute>[
  GoRoute(path: UserRoutes.login, pageBuilder: (context, state) => tabPage(state, const LoginPage())),
  GoRoute(path: UserRoutes.onboarding, pageBuilder: (context, state) => tabPage(state, const OnboardingPage())),
  fullScreenRoute(UserRoutes.mySpace, (context, state) => const MySpacePage()),
  fullScreenRoute(UserRoutes.preferences, (context, state) => const PreferencesPage()),
  fullScreenRoute(
    UserRoutes.contents,
    (context, state) => ComingSoonPage(title: context.t.user.contents.title, wireframe: 'E02'),
  ),
];
