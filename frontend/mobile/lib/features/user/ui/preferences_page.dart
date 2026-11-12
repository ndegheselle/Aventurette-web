import 'package:ajil/features/user/models/preferences.dart';
import 'package:ajil/features/user/state/filter_defaults.dart';
import 'package:ajil/features/user/state/preferences.dart';
import 'package:ajil/features/user/ui/filter_defaults_fields.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/ui/inputs/pills.dart';
import 'package:ajil/ui/overlays/toast.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// The languages the app has strings for. Null follows the device.
const _languages = <String?>[null, 'fr', 'en'];

/// *Mes préférences* (E03): what the web's settings and profile held — the language, the theme
/// and the catalogue's default filters. The wireframe's other fields need data that does not
/// exist yet.
class PreferencesPage extends ConsumerWidget {
  const PreferencesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final preferences = ref.watch(preferencesProvider);
    final preferencesNotifier = ref.read(preferencesProvider.notifier);
    final defaults = ref.watch(filterDefaultsProvider);
    final defaultsNotifier = ref.read(filterDefaultsProvider.notifier);

    Future<void> saveDefaults() async {
      final saved = await runAction(context, () async {
        await defaultsNotifier.save();
        return true;
      });
      if (saved == true && context.mounted) showToast(context, t.user.preferences.saved);
    }

    return AppPage(
      header: BackHeader(title: t.user.preferences.title),
      body: PageScroll(
        children: [
          LabeledField(
            label: t.user.preferences.language,
            child: PillTabs(
              values: _languages,
              selected: preferences.language,
              labelOf: (language) => t.user.preferences.languages[language ?? 'device']!,
              onChanged: preferencesNotifier.setLanguage,
              wrap: true,
            ),
          ),
          LabeledField(
            label: t.user.preferences.theme,
            child: PillTabs(
              values: ThemeChoice.values,
              selected: preferences.theme,
              labelOf: (theme) => t.user.preferences.themes[theme.name]!,
              onChanged: preferencesNotifier.setTheme,
              wrap: true,
            ),
          ),
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 12,
              children: [
                Text(t.user.filterDefaults.title, style: context.headingText),
                Text(t.user.filterDefaults.help, style: context.captionText),
                AsyncView(
                  value: defaults,
                  data: (value) => FilterDefaultsFields(defaults: value, onChanged: defaultsNotifier.edit),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: BottomActionBar(
        children: [
          FButton(
            size: .lg,
            onPress: defaults.hasValue ? saveDefaults : null,
            child: Text(t.ui.actions.save),
          ),
        ],
      ),
    );
  }
}
