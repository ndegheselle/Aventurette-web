import 'package:ajil/features/user/api/preferences_api.dart';
import 'package:ajil/features/user/models/preferences.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// The device's theme and language. The app reads them to pick the palette and the strings.
class PreferencesNotifier extends Notifier<Preferences> {
  @override
  Preferences build() => ref.read(preferencesApiProvider).read();

  Future<void> setTheme(ThemeChoice theme) => _save(Preferences(theme: theme, language: state.language));

  Future<void> setLanguage(String? language) => _save(Preferences(theme: state.theme, language: language));

  Future<void> _save(Preferences preferences) async {
    state = preferences;
    await ref.read(preferencesApiProvider).save(preferences);
  }
}

final preferencesProvider = NotifierProvider<PreferencesNotifier, Preferences>(PreferencesNotifier.new);
