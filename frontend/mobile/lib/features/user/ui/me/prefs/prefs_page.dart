import 'package:ajil/features/user/state/filter_defaults.dart';
import 'package:ajil/features/user/ui/me/prefs/filter_defaults_fields.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/toast.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// *Mes préférences* (E03): the catalogue's default filters. The language and the theme are on
/// *Mon espace*. The wireframe's other fields need data that does not exist yet.
class PreferencesPage extends ConsumerWidget {
  const PreferencesPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final defaults = ref.watch(filterDefaultsProvider);
    final defaultsNotifier = ref.read(filterDefaultsProvider.notifier);

    Future<void> saveDefaults() async {
      final saved = await runAction(context, () async {
        await defaultsNotifier.save();
        return true;
      });
      if (saved == true && context.mounted) {
        showAppToast(
          context,
          icon: FLucideIcons.save,
          title: t.ui.actions.results.saved,
          description: t.user.preferences.saved,
        );
      }
    }

    return AppPage(
      header: BackHeader(title: t.user.preferences.title),
      body: PageScroll(
        children: [
          Panel(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: AppSpaces.spacing,
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
          FButton(size: .lg, onPress: defaults.hasValue ? saveDefaults : null, child: Text(t.ui.actions.save)),
        ],
      ),
    );
  }
}
