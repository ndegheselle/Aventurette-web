import 'package:ajil/core/errors.dart';
import 'package:ajil/features/user/api/session_api.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// The one session, shared by every screen: null while nobody is signed in. Read once at start
/// from what the device kept; the router waits for it.
class SessionNotifier extends AsyncNotifier<SessionUser?> {
  SessionApi get _api => ref.read(sessionApiProvider);

  @override
  Future<SessionUser?> build() => _api.refresh();

  Future<void> loginWithOtp(String otpId, String code) async {
    final user = await _api.loginWithOtp(otpId, code);
    state = AsyncData(user);
  }

  Future<void> loginWithPassword(String email, String password) async {
    final user = await _api.loginWithPassword(email, password);
    state = AsyncData(user);
  }

  /// Read the session again: after the onboarding, so the router knows it was seen.
  Future<void> reload() async {
    state = AsyncData(await _api.refresh());
  }

  /// Drop the session. Where to go next is the router's: nobody signed in means the login.
  Future<void> logout() async {
    await _api.logout();
    state = const AsyncData(null);
  }
}

final sessionProvider = AsyncNotifierProvider<SessionNotifier, SessionUser?>(SessionNotifier.new);

/// The signed-in user's id. Only private screens read it, and the router keeps those behind the
/// session, so nobody signed in here is a bug.
final currentUserIdProvider = Provider<String>((ref) {
  final user = ref.watch(sessionProvider).value;
  if (user == null) throw NotAuthenticatedError();
  return user.id;
});
