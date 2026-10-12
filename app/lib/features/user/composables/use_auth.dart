import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/user/api/session.dart';
import 'package:aventurette/features/user/model/user.dart' show Role, UserData;
import 'package:aventurette/features/user/model/user.dart' as user_model show hasRole;
import 'package:flutter/foundation.dart';

/// The session. `shared` is the one the app uses: signing in anywhere signs in everywhere.
/// It never navigates — moving between screens is left to whoever asks for it.
class UseAuth extends ChangeNotifier {
  UseAuth(this._auth);

  static final UseAuth shared = UseAuth(sessionProvider());

  final AuthProvider<UserData> _auth;

  UserData? _current;

  UserData? get current => _current;
  bool get isLoggedIn => _current != null;

  Future<void> register(String email, String password, String passwordConfirm) async {
    _current = await _auth.register(email, password, passwordConfirm);
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    _current = await _auth.login(email, password);
    notifyListeners();
  }

  /// Drop the session. Where to go next is the caller's.
  void logout() {
    _auth.logout();
    _current = null;
    notifyListeners();
  }

  /// Asks whether the stored session is still valid, and loads its user.
  Future<bool> refresh() async {
    _current = await _auth.refresh();
    notifyListeners();
    return isLoggedIn;
  }

  /// Whether the signed-in user holds one of `roles`.
  bool hasRole(List<Role> roles) => user_model.hasRole(_current, roles);

  String currentId() {
    final user = _current;
    if (user == null) throw NotAuthenticatedError();
    return user.id;
  }
}
