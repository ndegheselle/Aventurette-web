import 'package:aventurette/app/app.dart';
import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/backend/index.dart';
import 'package:flutter/widgets.dart';

/// Set at build time: `flutter run --dart-define-from-file=env.json`.
const _apiUrl = String.fromEnvironment('API_URL');

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Connects to the backend before any api module is used.
  await initBackend(_apiUrl);
  final i18n = await I18n.load();

  runApp(App(i18n: i18n));
}
