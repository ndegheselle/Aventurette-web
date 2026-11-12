import 'package:ajil/features/user/models/user.dart';
import 'package:ajil/features/user/routes.dart';

/// Where the router sends a user before showing [location], or null to show it. While the
/// session is read, everything waits on [waiting]. Nobody signed in goes to the login, unless the
/// page is public; a user who has not seen the onboarding goes there first; a signed-in user on
/// the login, the onboarding or the waiting page goes [home].
String? redirectFor({
  required bool loading,
  required SessionUser? user,
  required String location,
  required String waiting,
  required String home,
}) {
  if (loading) return location == waiting ? null : waiting;

  if (user == null) return UserRoutes.public.contains(location) ? null : UserRoutes.login;

  if (needsOnboarding(user)) return location == UserRoutes.onboarding ? null : UserRoutes.onboarding;

  const leftOnceSignedIn = {UserRoutes.login, UserRoutes.onboarding};
  if (location == waiting || leftOnceSignedIn.contains(location)) return home;

  return null;
}
