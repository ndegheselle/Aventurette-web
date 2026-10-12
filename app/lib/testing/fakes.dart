import 'package:aventurette/core/core.dart';

/// A file resolver that needs no backend: `url:<record id>/<file>`.
class FakeFileUrls implements FileUrlResolver {
  @override
  String getUrl(JsonMap record, String filename) => 'url:${record['id']}/$filename';
}

/// An in-memory session: accepts one password, and remembers who is signed in.
class FakeAuthProvider<TUser extends BaseEntity> implements AuthProvider<TUser> {
  FakeAuthProvider(this.user, {this.password = 'secret', this.stored});

  final TUser user;
  final String password;

  /// The session a `refresh` revives, if any.
  TUser? stored;

  int refreshCalls = 0;

  @override
  Future<TUser> login(String email, String password) async {
    if (password != this.password) throw ValidationError();
    stored = user;
    return user;
  }

  @override
  Future<TUser> register(String email, String password, String passwordConfirm) async {
    stored = user;
    return user;
  }

  @override
  Future<TUser?> refresh() async {
    refreshCalls++;
    return stored;
  }

  @override
  void logout() => stored = null;
}
