/// The device's display settings: its theme and its language.
library;

enum ThemeChoice { auto, light, dark }

class Preferences {
  const Preferences({this.theme = ThemeChoice.auto, this.language});

  final ThemeChoice theme;

  /// A language code the app has strings for; null follows the device.
  final String? language;
}

/// Whether the dark theme applies: chosen, or left to the device and the device is dark.
bool isDark(ThemeChoice choice, {required bool deviceIsDark}) => switch (choice) {
  ThemeChoice.auto => deviceIsDark,
  ThemeChoice.light => false,
  ThemeChoice.dark => true,
};
