import 'package:riverpod/riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:pocketbase/pocketbase.dart';

/// Set with `--dart-define=API_URL=…`. The default is a PocketBase running on this machine; an
/// Android emulator reaches it at `http://10.0.2.2:8090` instead.
const apiUrl = String.fromEnvironment('API_URL', defaultValue: 'http://127.0.0.1:8090');

const _sessionKey = 'pb_auth';

/// The client, with the session kept in the platform's secure storage so it survives a restart.
/// Read before the app starts: the router decides the first screen from it.
Future<PocketBase> createPocketBase() async {
  const storage = FlutterSecureStorage();
  final store = AsyncAuthStore(
    initial: await storage.read(key: _sessionKey),
    save: (data) => storage.write(key: _sessionKey, value: data),
    clear: () => storage.delete(key: _sessionKey),
  );
  return PocketBase(apiUrl, authStore: store);
}

/// Overridden in `main.dart` with the client [createPocketBase] built. Tests override the ports
/// instead and never reach it.
final pocketBaseProvider = Provider<PocketBase>(
  (ref) => throw StateError('pocketBaseProvider is overridden in main.dart'),
);
