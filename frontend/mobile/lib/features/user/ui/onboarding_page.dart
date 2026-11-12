import 'package:ajil/features/user/state/filter_defaults.dart';
import 'package:ajil/features/user/ui/filter_defaults_fields.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:remix/remix.dart';

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
            StyledText(t.user.onboarding.intro, style: captionText()),
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
                child: RemixButton(
                  label: t.user.onboarding.later,
                  style: buttonStyle(variant: ButtonVariant.outline, size: ControlSize.lg),
                  onPressed: () => runAction(context, notifier.skip),
                ),
              ),
              Expanded(
                child: RemixButton(
                  label: t.ui.actions.save,
                  enabled: defaults.hasValue,
                  style: buttonStyle(size: ControlSize.lg),
                  onPressed: () => runAction(context, notifier.save),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
