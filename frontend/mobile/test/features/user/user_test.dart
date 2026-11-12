import 'package:ajil/features/user/api/filter_defaults_mapper.dart';
import 'package:ajil/features/user/api/session_api.dart';
import 'package:ajil/features/user/guard.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:ajil/features/user/routes.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/fake_crud.dart';

const onboarded = SessionUser(id: 'u1', email: 'e', name: 'n', role: Role.user, onboarded: true);
const newcomer = SessionUser(id: 'u1', email: 'e', name: 'n', role: Role.user, onboarded: false);

String? redirect({bool loading = false, SessionUser? user, required String location}) =>
    redirectFor(loading: loading, user: user, location: location, waiting: '/', home: '/catalogue');

void main() {
  group('the router', () {
    test('waits on the waiting page while the session is read', () {
      expect(redirect(loading: true, location: '/catalogue'), '/');
      expect(redirect(loading: true, location: '/'), isNull);
    });

    test('sends nobody signed in to the login, but lets the login through', () {
      expect(redirect(location: '/activities/a1'), UserRoutes.login);
      expect(redirect(location: UserRoutes.login), isNull);
    });

    test('sends a user who has not seen the onboarding there first', () {
      expect(redirect(user: newcomer, location: '/catalogue'), UserRoutes.onboarding);
      expect(redirect(user: newcomer, location: UserRoutes.onboarding), isNull);
    });

    test('sends a signed-in user off the login, the onboarding and the waiting page', () {
      for (final location in ['/', UserRoutes.login, UserRoutes.onboarding]) {
        expect(redirect(user: onboarded, location: location), '/catalogue');
      }
      expect(redirect(user: onboarded, location: '/activities/a1'), isNull);
    });
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
