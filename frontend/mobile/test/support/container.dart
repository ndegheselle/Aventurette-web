import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/auth/auth_provider.dart';
import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'fake_crud.dart';

/// A session the device kept: [user] is the record the auth port gives back, null for nobody.
class FakeAuth implements AuthProvider {
  FakeAuth([this.user]);

  Payload? user;

  @override
  Future<String> requestOtp(String email) async => 'otp';

  @override
  Future<Payload> loginWithOtp(String otpId, String code) async => user ?? (throw StateError('Wrong code'));

  @override
  Future<Payload?> refresh() async => user;

  @override
  Future<void> logout() async => user = null;
}

/// A user record as the session holds it.
Payload sessionRecord({String id = 'u1', bool onboarded = true}) => {
  'id': id,
  'email': 'camille@example.fr',
  'name': 'Camille',
  'role': 'USER',
  'onboarded': onboarded,
};

/// A container on the fake ports, with [user] signed in, and the session read before it is
/// handed back, as the router waits for it.
Future<ProviderContainer> signedInContainer({FakeCrudFactory? crud, Payload? user}) async {
  final container = ProviderContainer(
    overrides: [
      crudFactoryProvider.overrideWithValue(crud ?? FakeCrudFactory()),
      authProviderProvider.overrideWithValue(FakeAuth(user ?? sessionRecord())),
    ],
  );
  addTearDown(container.dispose);
  await container.read(sessionProvider.future);
  return container;
}
