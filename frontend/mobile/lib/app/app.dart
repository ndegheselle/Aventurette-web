import 'package:ajil/app/router.dart';
import 'package:ajil/features/user/models/preferences.dart';
import 'package:ajil/features/user/state/preferences.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// Shows the strings of [language], or the device's when it is null.
void applyLanguage(String? language) {
  if (language == null) {
    LocaleSettings.useDeviceLocale();
  } else {
    LocaleSettings.setLocaleRaw(language);
  }
}

/// The app: a `WidgetsApp`, not a `MaterialApp` — forui draws every control. forui's neutral
/// theme, its toaster and our router.
class AjilApp extends ConsumerWidget {
  const AjilApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    ref.listen(preferencesProvider, (previous, next) {
      if (previous?.language != next.language) applyLanguage(next.language);
    });
    final theme = ref.watch(preferencesProvider).theme;

    return WidgetsApp.router(
      title: 'Ajil',
      color: FColors.neutralLight.primary,
      routerConfig: ref.watch(routerProvider),
      locale: TranslationProvider.of(context).flutterLocale,
      supportedLocales: AppLocaleUtils.supportedLocales,
      localizationsDelegates: FLocalizations.localizationsDelegates,
      debugShowCheckedModeBanner: false,
      builder: (context, child) {
        final deviceIsDark = MediaQuery.platformBrightnessOf(context) == Brightness.dark;
        final data = isDark(theme, deviceIsDark: deviceIsDark) ? FTheme.neutral.dark.touch : FTheme.neutral.light.touch;

        return FTheme(
          data: data,
          // forui styles its own icons; this is for the ones drawn outside its widgets.
          child: IconTheme(
            data: IconThemeData(color: data.colors.foreground, size: 20),
            // At the top, under the status bar: the toaster keeps out of the safe area itself.
            child: FToaster(
              style: const .delta(toastAlignment: .topCenter, padding: .value(EdgeInsets.all(16))),
              child: child ?? const SizedBox.shrink(),
            ),
          ),
        );
      },
    );
  }
}
