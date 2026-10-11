import 'package:aventurette/core/data/entity.dart';

/// The session seam. Implementations persist the session themselves; the app calls `refresh`
/// on boot to find out whether one is still valid.
abstract interface class AuthProvider<TUser extends BaseEntity> {
  /// Authenticate and start a session. Throws if the credentials are rejected.
  Future<TUser> login(String email, String password);

  /// Create an account, start a session, and trigger the backend's verification flow.
  Future<TUser> register(String email, String password, String passwordConfirm);

  /// Revive an existing session, or resolve to null when there is none.
  Future<TUser?> refresh();

  /// Discard the local session.
  void logout();
}
