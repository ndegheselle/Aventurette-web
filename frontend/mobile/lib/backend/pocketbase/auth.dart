import 'package:ajil/backend/pocketbase/errors.dart';
import 'package:ajil/core/auth/auth_provider.dart';
import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/errors.dart';
import 'package:pocketbase/pocketbase.dart';

/// The code PocketBase gives an email that another account already has.
const _emailTaken = 'validation_not_unique';

/// [AuthProvider] over a PocketBase auth collection. [fields] are the user fields the session
/// holds, and the only ones asked for: the rest of the record is read by whatever needs it.
class PocketBaseAuth implements AuthProvider {
  PocketBaseAuth(this._client, String collection, List<String> fields)
    : _collection = _client.collection(collection),
      // The SDK needs the token beside the record to keep the session.
      _fields = ['token', for (final field in fields) 'record.$field'].join(',');

  final PocketBase _client;
  final RecordService _collection;
  final String _fields;

  @override
  Future<void> signUp(String email, String name) async {
    try {
      // The created record is not read: the session starts with the code.
      await mapErrors(() => _collection.create(body: {'email': email, 'name': name}, fields: 'id'));
    } on ValidationError catch (error) {
      // The account exists: the code will sign its owner in, as from the login.
      if (error.fields['email'] == _emailTaken) return;
      rethrow;
    }
  }

  @override
  Future<String> requestOtp(String email) async {
    final response = await mapErrors(() => _collection.requestOTP(email));
    return response.otpId;
  }

  @override
  Future<Payload> loginWithOtp(String otpId, String code) async {
    final auth = await mapErrors(() => _collection.authWithOTP(otpId, code, fields: _fields));
    return auth.record.toJson();
  }

  @override
  Future<Payload> loginWithPassword(String email, String password) async {
    final auth = await mapErrors(() => _collection.authWithPassword(email, password, fields: _fields));
    return auth.record.toJson();
  }

  @override
  Future<Payload?> refresh() async {
    if (!_client.authStore.isValid) return null;

    // An expired or revoked session is expected here, not an error.
    try {
      final auth = await _collection.authRefresh(fields: _fields);
      return auth.record.toJson();
    } on ClientException {
      _client.authStore.clear();
      return null;
    }
  }

  @override
  Future<void> logout() async => _client.authStore.clear();
}
