import 'package:aventurette/features/user/composables/use_auth.dart';
import 'package:aventurette/features/user/guard.dart';
import 'package:aventurette/features/user/model/user.dart';
import 'package:aventurette/features/user/routes.dart';
import 'package:aventurette/testing/testing.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late FakeAuthProvider<UserData> provider;
  late UseAuth auth;

  setUp(() {
    provider = FakeAuthProvider(aUser());
    auth = UseAuth(provider);
  });

  test('lets login and register through without asking the backend', () async {
    expect(await authGuard(routeName: routesNames.login, auth: auth), isNull);
    expect(await authGuard(routeName: routesNames.register, auth: auth), isNull);
    expect(provider.refreshCalls, 0);
  });

  test('sends an anonymous visitor to login', () async {
    expect(await authGuard(routeName: 'activities', auth: auth), loginPath);
  });

  test('admits a visitor whose stored session is valid', () async {
    provider.stored = aUser();

    expect(await authGuard(routeName: 'activities', auth: auth), isNull);
    expect(auth.isLoggedIn, isTrue);
  });

  test('does not ask the backend again once signed in', () async {
    await auth.login('ada@example.com', 'secret');

    expect(await authGuard(routeName: 'activities', auth: auth), isNull);
    expect(provider.refreshCalls, 0);
  });
}
