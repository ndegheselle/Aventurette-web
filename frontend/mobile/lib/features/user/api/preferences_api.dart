import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/user/models/preferences.dart';
import 'package:riverpod/riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// The device's own settings, kept on the device: they are this phone's, not the account's.
class PreferencesApi {
  const PreferencesApi(this._store);

  static const _themeKey = 'theme';
  static const _languageKey = 'language';

  final SharedPreferences _store;

  Preferences read() => Preferences(
    theme: enumOf(ThemeChoice.values, _store.getString(_themeKey)) ?? ThemeChoice.auto,
    language: _store.getString(_languageKey),
  );

  Future<void> save(Preferences preferences) async {
    await _store.setString(_themeKey, constantOf(preferences.theme));
    final language = preferences.language;
    if (language == null) {
      await _store.remove(_languageKey);
    } else {
      await _store.setString(_languageKey, language);
    }
  }
}

/// Overridden in `main.dart` with the instance read before the app starts, so the first frame
/// already has the right theme and language.
final sharedPreferencesProvider = Provider<SharedPreferences>(
  (ref) => throw StateError('sharedPreferencesProvider is overridden in main.dart'),
);

final preferencesApiProvider = Provider((ref) => PreferencesApi(ref.watch(sharedPreferencesProvider)));
