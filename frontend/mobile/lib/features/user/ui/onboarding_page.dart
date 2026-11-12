import 'package:ajil/features/user/state/filter_defaults.dart';
import 'package:ajil/features/user/ui/filter_defaults_fields.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// Shown once, at the first sign-in: the filter defaults, to set now or later. Either way the
/// session then counts as onboarded, and the router moves on.
class OnboardingPage extends ConsumerWidget {
  const OnboardingPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final defaults = ref.watch(filterDefaultsProvider);
    final notifier = ref.read(filterDefaultsProvider.notifier);

    return AppPage(
      header: TabHeader(title: t.user.onboarding.title),
      body: AsyncView(
        value: defaults,
        data: (value) => PageScroll(
          children: [
            Text(t.user.onboarding.intro, style: context.captionText),
            FilterDefaultsFields(defaults: value, onChanged: notifier.edit),
          ],
        ),
      ),
      actions: BottomActionBar(
        children: [
          Row(
            spacing: 8,
            children: [
              Expanded(
                child: FButton(
                  variant: .outline,
                  size: .lg,
                  onPress: () => runAction(context, notifier.skip),
                  child: Text(t.user.onboarding.later),
                ),
              ),
              Expanded(
                child: FButton(
                  size: .lg,
                  onPress: defaults.hasValue ? () => runAction(context, notifier.save) : null,
                  child: Text(t.ui.actions.save),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
