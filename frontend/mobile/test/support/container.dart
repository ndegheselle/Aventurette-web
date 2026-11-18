import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/auth/auth_provider.dart';
import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';

import 'fake_crud.dart';

/// A session the device kept: [user] is the record the auth port gives back, null for nobody.
/// [calls] lists the sign-ups and the codes asked for, in order; [signUpRefused] makes a sign-up
/// throw.
class FakeAuth implements AuthProvider {
  FakeAuth([this.user]);

  Payload? user;
  final calls = <String>[];
  bool signUpRefused = false;

  @override
  Future<void> signUp(String email, String name) async {
    if (signUpRefused) throw StateError('Refused');
    calls.add('signUp $email');
  }

  @override
  Future<String> requestOtp(String email) async {
    calls.add('requestOtp $email');
    return 'otp';
  }

  @override
  Future<Payload> loginWithOtp(String otpId, String code) async => user ?? (throw StateError('Wrong code'));

  @override
  Future<Payload> loginWithPassword(String email, String password) async =>
      user ?? (throw StateError('Wrong password'));

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
