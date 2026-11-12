import 'package:ajil/features/user/state/login_form.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/app_theme.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

/// Signing in with a code sent by email. The router leaves this page once the session is set.
class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _email = TextEditingController();
  final _code = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _code.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.user.login;
    final form = ref.watch(loginFormProvider);
    final notifier = ref.read(loginFormProvider.notifier);

    final error = switch (form.error) {
      LoginError.codeNotSent => t.codeNotSent,
      LoginError.codeRejected => t.codeRejected,
      null => null,
    };

    final steps = form.codeSent
        ? [
            StyledText(t.codeSentTo(email: form.email), style: bodyText()),
            LabeledField(
              label: t.code,
              child: RemixTextField(
                controller: _code,
                keyboardType: TextInputType.number,
                autofillHints: const [AutofillHints.oneTimeCode],
                leading: Icon(LucideIcons.keyRound, size: 18, color: context.muted),
                error: form.error == LoginError.codeRejected,
                onSubmitted: notifier.login,
                style: textFieldStyle(),
              ),
            ),
            RemixButton(
              label: t.title,
              loading: form.busy,
              style: buttonStyle(size: ControlSize.lg),
              onPressed: () => notifier.login(_code.text),
            ),
            RemixButton(
              label: t.changeEmail,
              style: buttonStyle(variant: ButtonVariant.ghost),
              onPressed: () {
                _code.clear();
                notifier.changeEmail();
              },
            ),
          ]
        : [
            LabeledField(
              label: t.email,
              child: RemixTextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                autofillHints: const [AutofillHints.email],
                leading: Icon(LucideIcons.mail, size: 18, color: context.muted),
                error: form.error == LoginError.codeNotSent,
                onSubmitted: notifier.requestCode,
                style: textFieldStyle(),
              ),
            ),
            RemixButton(
              label: t.sendCode,
              loading: form.busy,
              style: buttonStyle(size: ControlSize.lg),
              onPressed: () => notifier.requestCode(_email.text),
            ),
          ];

    return AppPage(
      header: const SizedBox(height: 32),
      body: PageScroll(
        children: [
          StyledText('Ajil', style: titleText().fontSize(AppSizes.fontXl())),
          StyledText(t.title, style: headingText()),
          ...steps,
          if (error != null) StyledText(error, style: captionText().color(AppColors.danger.fill())),
        ],
      ),
    );
  }
}
