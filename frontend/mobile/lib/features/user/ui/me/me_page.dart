import 'package:ajil/features/notifications/routes.dart';
import 'package:ajil/features/user/models/preferences.dart';
import 'package:ajil/features/user/routes.dart';
import 'package:ajil/features/user/state/preferences.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/sheet.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// The languages the app has strings for, and the device's. A radio menu cannot hold null as a
/// choice, so the device's has a code of its own here; the preferences store it as null.
const _deviceLanguage = 'device';
const _languages = [_deviceLanguage, 'fr', 'en'];

/// *Mon espace* (E01): who is signed in, and the pages about them. Each entry opens over this
/// page, so back comes here.
class MySpacePage extends ConsumerWidget {
  const MySpacePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final user = ref.watch(sessionProvider).value;
    final preferences = ref.watch(preferencesProvider);
    final preferencesNotifier = ref.read(preferencesProvider.notifier);
    String languageName(String language) => t.user.preferences.languages[language]!;
    String themeName(ThemeChoice theme) => t.user.preferences.themes[theme.name]!;

    Future<void> logout() async {
      final confirmed = await showAppSheet<bool>(
        context,
        title: t.user.account.logout,
        builder: (_) => Text(t.user.account.logoutConfirm, style: context.bodyText),
        actionsBuilder: (sheetContext) => FButton(
          variant: .destructive,
          size: .lg,
          onPress: () => Navigator.of(sheetContext).pop(true),
          child: Text(t.user.account.logout),
        ),
      );
      // The router sends a signed-out user to the login.
      if (confirmed ?? false) await ref.read(sessionProvider.notifier).logout();
    }

    FTile entry(IconData icon, String title, String location) => FTile(
      prefix: Icon(icon),
      title: Text(title),
      suffix: const Icon(FLucideIcons.chevronRight),
      onPress: () => context.push(location),
    );

    return AppPage(
      header: BackHeader(title: t.user.menu.title),
      body: PageScroll(
        children: [
          FTileGroup(
            children: [
              entry(FLucideIcons.slidersHorizontal, t.user.menu.preferences, UserRoutes.preferences),
              entry(FLucideIcons.folderOpen, t.user.menu.contents, UserRoutes.contents),
              entry(FLucideIcons.bell, t.user.menu.notifications, NotificationsRoutes.inbox),
            ],
          ),
          FTileGroup(
            label: Text(t.user.account.title),
            children: [
                            FSelectMenuTile<String>.fromMap(
                {for (final language in _languages) languageName(language): language},
                prefix: const Icon(FLucideIcons.languages),
                title: Text(t.user.preferences.language),
                detailsBuilder: (context, values, _) => Text(languageName(values.first)),
                selectControl: .managedRadio(
                  initial: preferences.language ?? _deviceLanguage,
                  onChange: (values) {
                    final language = values.first;
                    preferencesNotifier.setLanguage(language == _deviceLanguage ? null : language);
                  },
                ),
              ),
              FSelectMenuTile<ThemeChoice>.fromMap(
                {for (final theme in ThemeChoice.values) themeName(theme): theme},
                prefix: const Icon(FLucideIcons.sunMoon),
                title: Text(t.user.preferences.theme),
                detailsBuilder: (context, values, _) => Text(themeName(values.first)),
                selectControl: .managedRadio(
                  initial: preferences.theme,
                  onChange: (values) => preferencesNotifier.setTheme(values.first),
                ),
              ),
              FTile(prefix: const Icon(FLucideIcons.mail), title: Text(user?.email ?? "")),
              FTile(
                variant: .destructive,
                prefix: const Icon(FLucideIcons.logOut),
                title: Text(t.user.account.logout),
                onPress: logout,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
