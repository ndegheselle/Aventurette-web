import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/user/composables/use_auth.dart';
import 'package:aventurette/features/user/model/user.dart';
import 'package:aventurette/testing/testing.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  late FakeAuthProvider<UserData> provider;
  late UseAuth auth;

  setUp(() {
    provider = FakeAuthProvider(aUser());
    auth = UseAuth(provider);
  });

  test('a rejected login reaches the caller and leaves the session empty', () async {
    await expectLater(auth.login('ada@example.com', 'wrong'), throwsA(isA<ValidationError>()));

    expect(auth.isLoggedIn, isFalse);
  });

  test('logout clears the session', () async {
    await auth.login('ada@example.com', 'secret');
    auth.logout();

    expect(auth.isLoggedIn, isFalse);
    expect(provider.stored, isNull);
  });

  test('currentId throws rather than returning an empty id when signed out', () {
    expect(auth.currentId, throwsA(isA<NotAuthenticatedError>()));
  });

  test('currentId is the signed-in user\'s', () async {
    await auth.login('ada@example.com', 'secret');

    expect(auth.currentId(), 'usr1');
  });
}
