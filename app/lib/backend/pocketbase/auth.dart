import 'package:aventurette/backend/pocketbase/errors.dart';
import 'package:aventurette/backend/pocketbase/files.dart';
import 'package:aventurette/core/core.dart';
import 'package:pocketbase/pocketbase.dart';

/// AuthProvider backed by a PocketBase auth collection.
class PocketBaseAuth<TUser extends BaseEntity> implements AuthProvider<TUser> {
  PocketBaseAuth(this._client, String collection, this._mapper)
    : _service = _client.collection(collection),
      _files = PocketBaseFileUrls(_client);

  final PocketBase _client;
  final RecordService _service;
  final EntityMapper<TUser> _mapper;
  final PocketBaseFileUrls _files;

  TUser _toUser(RecordModel record) => _mapper.toEntity(record.toJson(), _files);

  @override
  Future<TUser> login(String email, String password) async {
    final result = await mapErrors(() => _service.authWithPassword(email, password));
    return _toUser(result.record);
  }

  @override
  Future<TUser> register(String email, String password, String passwordConfirm) {
    return mapErrors(() async {
      await _service.create(body: {'email': email, 'password': password, 'passwordConfirm': passwordConfirm});
      await _service.requestVerification(email);
      final result = await _service.authWithPassword(email, password);
      return _toUser(result.record);
    });
  }

  @override
  Future<TUser?> refresh() async {
    // A missing or expired session is expected here, not an error.
    try {
      final result = await _service.authRefresh();
      return _toUser(result.record);
    } catch (_) {
      return null;
    }
  }

  @override
  void logout() => _client.authStore.clear();
}
