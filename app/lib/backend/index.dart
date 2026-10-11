/// The only place in the app that knows which backend it talks to. `package:pocketbase` may
/// not be imported anywhere else — everything downstream uses the ports built here.
library;

import 'package:aventurette/backend/pocketbase/auth.dart';
import 'package:aventurette/backend/pocketbase/crud.dart';
import 'package:aventurette/core/core.dart';
import 'package:pocketbase/pocketbase.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _sessionKey = 'pocketbase_auth';

late final PocketBase _client;

/// Connects to the backend, and restores the stored session. Call once, before `runApp`.
Future<void> initBackend(String apiUrl) async {
  if (apiUrl.isEmpty) {
    throw StateError(
      'API_URL is not set — run with --dart-define-from-file=env.json (see env.example.json).',
    );
  }

  final preferences = await SharedPreferences.getInstance();
  final store = AsyncAuthStore(
    save: (data) async => preferences.setString(_sessionKey, data),
    clear: () async => preferences.remove(_sessionKey),
    initial: preferences.getString(_sessionKey),
  );
  _client = PocketBase(apiUrl, authStore: store);
}

/// A CRUD service for one collection, reading through to the server every time.
DataCrud<TEntity> crud<TEntity extends BaseEntity>(String collection, EntityMapper<TEntity> mapper) {
  return PocketBaseCrud<TEntity>(_client, collection, mapper);
}

/// The same, for a collection the app also writes to.
WritableCrud<TEntity> writableCrud<TEntity extends BaseEntity>(
  String collection,
  WritableMapper<TEntity> mapper,
) {
  return PocketBaseWritableCrud<TEntity>(_client, collection, mapper);
}

/// The auth provider of the users collection. One instance, so the session is shared.
AuthProvider<TUser> authProvider<TUser extends BaseEntity>(EntityMapper<TUser> mapper) {
  return PocketBaseAuth<TUser>(_client, 'users', mapper);
}
