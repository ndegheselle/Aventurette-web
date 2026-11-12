import 'package:ajil/core/data/mapper.dart';

/// The session seam. The implementation persists the session itself; the app calls [refresh] on
/// start to find out whether one is still valid.
abstract interface class AuthProvider {
  /// Email a one-time code. Resolves to the id [loginWithOtp] needs alongside the code. Resolves
  /// the same whether or not an account has that email, so nobody can probe which exist.
  Future<String> requestOtp(String email);

  /// Authenticate with a code [requestOtp] sent, and start a session. Throws if it is wrong or
  /// expired. Resolves to the user record's session fields.
  Future<Payload> loginWithOtp(String otpId, String code);

  /// Revive an existing session, or resolve to null when there is none.
  Future<Payload?> refresh();

  /// Discard the local session.
  Future<void> logout();
}
