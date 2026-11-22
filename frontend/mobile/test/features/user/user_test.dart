import 'package:ajil/backend/backend.dart';
import 'package:ajil/features/user/api/filter_defaults_mapper.dart';
import 'package:ajil/features/user/api/session_api.dart';
import 'package:ajil/features/user/guard.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:ajil/features/user/routes.dart';
import 'package:ajil/features/user/state/login_form.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/container.dart';
import '../../support/fake_crud.dart';

const onboarded = SessionUser(id: 'u1', email: 'e', name: 'n', role: Role.user, onboarded: true);
const newcomer = SessionUser(id: 'u1', email: 'e', name: 'n', role: Role.user, onboarded: false);

String? redirect({bool loading = false, SessionUser? user, required String location}) =>
    redirectFor(loading: loading, user: user, location: location, waiting: '/', home: '/catalogue');

/// Nobody signed in, with the login form kept alive as the page watching it would.
Future<(ProviderContainer, FakeAuth)> signedOut() async {
  final auth = FakeAuth();
  final container = ProviderContainer(overrides: [authProviderProvider.overrideWithValue(auth)]);
  addTearDown(container.dispose);
  container.listen(loginFormProvider, (_, _) {});
  return (container, auth);
}

void main() {
  group('the router', () {
    test('waits on the waiting page while the session is read', () {
      expect(redirect(loading: true, location: '/catalogue'), '/');
      expect(redirect(loading: true, location: '/'), isNull);
    });

    test('sends nobody signed in to the login, but lets the login and the sign-up through', () {
      expect(redirect(location: '/activities/a1'), UserRoutes.login);
      expect(redirect(location: UserRoutes.login), isNull);
      expect(redirect(location: UserRoutes.signUp), isNull);
    });

    test('sends a user who has not seen the onboarding there first', () {
      expect(redirect(user: newcomer, location: '/catalogue'), UserRoutes.onboarding);
      expect(redirect(user: newcomer, location: UserRoutes.onboarding), isNull);
    });

    test('sends a signed-in user off the login, the sign-up, the onboarding and the waiting page', () {
      for (final location in ['/', UserRoutes.login, UserRoutes.signUp, UserRoutes.onboarding]) {
        expect(redirect(user: onboarded, location: location), '/catalogue');
      }
      expect(redirect(user: onboarded, location: '/activities/a1'), isNull);
    });
  });

  group('the sign-up', () {
    const password = 'correct horse';

    test('creates the account before sending the code that verifies it', () async {
      final (container, auth) = await signedOut();

      await container.read(loginFormProvider.notifier).signUp('Camille', ' camille@example.fr ', password, password);

      expect(auth.calls, ['signUp camille@example.fr', 'requestOtp camille@example.fr']);
      expect(container.read(loginFormProvider).codeSent, isTrue);
    });

    test('sends no code for an account that could not be created', () async {
      final (container, auth) = await signedOut();
      auth.signUpRefused = true;

      await container.read(loginFormProvider.notifier).signUp('Camille', 'camille@example.fr', password, password);

      expect(auth.calls, isEmpty);
      expect(container.read(loginFormProvider).error, LoginError.accountNotCreated);
    });

    test('creates no account for a password too short or not confirmed', () async {
      final (container, auth) = await signedOut();
      final notifier = container.read(loginFormProvider.notifier);

      await notifier.signUp('Camille', 'camille@example.fr', 'short', 'short');
      expect(container.read(loginFormProvider).error, LoginError.passwordTooShort);

      await notifier.signUp('Camille', 'camille@example.fr', password, '${password}x');
      expect(container.read(loginFormProvider).error, LoginError.passwordsDiffer);

      expect(auth.calls, isEmpty);
    });
  });

  group('the password sign-in', () {
    test('sends the code that verifies an account never verified, and moves on to the code step', () async {
      final (container, auth) = await signedOut();
      auth.unverified = true;

      await container.read(loginFormProvider.notifier).loginWithPassword(' camille@example.fr ', 'correct horse');

      expect(auth.calls, ['requestOtp camille@example.fr']);
      expect(container.read(loginFormProvider).codeSent, isTrue);
      expect(container.read(loginFormProvider).error, isNull);
    });

    test('sends no code for a wrong password', () async {
      final (container, auth) = await signedOut();

      await container.read(loginFormProvider.notifier).loginWithPassword('camille@example.fr', 'wrong');

      expect(auth.calls, isEmpty);
      expect(container.read(loginFormProvider).codeSent, isFalse);
      expect(container.read(loginFormProvider).error, LoginError.passwordRejected);
    });
  });

  test('a sign-up password is long enough before it is confirmed', () {
    expect(passwordProblem('1234567', '1234567'), PasswordProblem.tooShort);
    expect(passwordProblem('1234567', '12345678'), PasswordProblem.tooShort);
    expect(passwordProblem('12345678', '12345679'), PasswordProblem.mismatch);
    // Kept as typed: a trailing space is part of the password.
    expect(passwordProblem('12345678', '12345678 '), PasswordProblem.mismatch);
    expect(passwordProblem('12345678', '12345678'), isNull);
  });

  test('a session with no role is a plain user, and one never onboarded is not', () {
    final user = sessionUserOf({'id': 'u1', 'role': ''});
    expect((user.role, user.onboarded), (Role.user, false));
  });

  group('the filter defaults', () {
    const mapper = FilterDefaultsMapper();

    test('read a stored 0 as an unset bound, and the places in Dart spelling', () {
      final defaults = mapper.toEntity({
        'defaultAgeMin': 0,
        'defaultAgeMax': 11,
        'defaultLocations': ['PARK', 'SPACE'],
      }, const FakeFiles());

      expect((defaults.ageMin, defaults.ageMax), (null, 11));
      expect(defaults.locations, [Location.park]);
    });

    test('write an unset bound as the 0 PocketBase would store, and the places in its spelling', () {
      final payload = mapper.toPayload(const FilterDefaults(participantsMax: 6, locations: [Location.lake]));

      expect(payload['defaultParticipantsMin'], 0);
      expect(payload['defaultParticipantsMax'], 6);
      expect(payload['defaultLocations'], ['LAKE']);
    });
  });
}
