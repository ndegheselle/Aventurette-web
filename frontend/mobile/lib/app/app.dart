import 'package:ajil/app/router.dart';
import 'package:ajil/features/user/models/preferences.dart';
import 'package:ajil/features/user/state/preferences.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/app_theme.dart';
import 'package:ajil/ui/theme/palette.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:remix/remix.dart';

/// Shows the strings of [language], or the device's when it is null.
void applyLanguage(String? language) {
  if (language == null) {
    LocaleSettings.useDeviceLocale();
  } else {
    LocaleSettings.setLocaleRaw(language);
  }
}

/// The app: no Material, no Cupertino. A `WidgetsApp` with our theme, our toasts and our router.
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
      color: Palette.light.primary.fill,
      routerConfig: ref.watch(routerProvider),
      locale: TranslationProvider.of(context).flutterLocale,
      supportedLocales: AppLocaleUtils.supportedLocales,
      debugShowCheckedModeBanner: false,
      builder: (context, child) {
        final deviceIsDark = MediaQuery.platformBrightnessOf(context) == Brightness.dark;
        final palette = isDark(theme, deviceIsDark: deviceIsDark) ? Palette.dark : Palette.light;

        return AppTheme(
          palette: palette,
          child: Overlay.wrap(
            child: RemixToastScope(
              placement: RemixToastPlacement.bottomCenter,
              inset: const EdgeInsetsDirectional.fromSTEB(16, 16, 16, 96),
              style: toastStyle(),
              child: child ?? const SizedBox.shrink(),
            ),
          ),
        );
      },
    );
  }
}
