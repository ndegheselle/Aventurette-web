import 'package:ajil/app/app.dart';
import 'package:ajil/backend/backend.dart';
import 'package:ajil/features/user/api/preferences_api.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Reads what the first frame needs — the device's preferences and the kept session — then
/// starts the app with them.
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final preferences = await SharedPreferences.getInstance();
  final pocketBase = await createPocketBase();
  applyLanguage(PreferencesApi(preferences).read().language);

  runApp(
    ProviderScope(
      overrides: [
        pocketBaseProvider.overrideWithValue(pocketBase),
        sharedPreferencesProvider.overrideWithValue(preferences),
      ],
      child: TranslationProvider(child: const AjilApp()),
    ),
  );
}
