import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/auth/auth_provider.dart';
import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:riverpod/riverpod.dart';

/// The session as the auth port gives it back: a user record holding the session's fields only.
/// The backend stores no role as the empty string: that is a plain user.
SessionUser sessionUserOf(Payload record) => SessionUser(
  id: record['id'] as String,
  email: (record['email'] as String?) ?? '',
  name: (record['name'] as String?) ?? '',
  role: enumOf(Role.values, record['role']) ?? Role.user,
  onboarded: (record['onboarded'] as bool?) ?? false,
);

/// The user feature's gateway to the auth port.
class SessionApi {
  const SessionApi(this._auth);

  final AuthProvider _auth;

  Future<String> requestOtp(String email) => _auth.requestOtp(email);

  Future<SessionUser> loginWithOtp(String otpId, String code) async =>
      sessionUserOf(await _auth.loginWithOtp(otpId, code));

  Future<SessionUser?> refresh() async {
    final record = await _auth.refresh();
    return record == null ? null : sessionUserOf(record);
  }

  Future<void> logout() => _auth.logout();
}

final sessionApiProvider = Provider((ref) => SessionApi(ref.watch(authProviderProvider)));
