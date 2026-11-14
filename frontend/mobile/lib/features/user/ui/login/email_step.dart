import 'package:ajil/features/user/state/login_form.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// The login's first step: the email a code is sent to, or a password to sign in without a mailbox.
class LoginEmailStep extends ConsumerStatefulWidget {
  const LoginEmailStep({super.key});

  @override
  ConsumerState<LoginEmailStep> createState() => _LoginEmailStepState();
}

class _LoginEmailStepState extends ConsumerState<LoginEmailStep> {
  // Back from the code step, the email typed before is still there to correct.
  late final _email = TextEditingController(text: ref.read(loginFormProvider).email);
  final _password = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.user.login;
    final form = ref.watch(loginFormProvider);
    final notifier = ref.read(loginFormProvider.notifier);

    // A busy form takes no second press, and says it is working.
    final busy = form.busy ? const FCircularProgress() : null;
    Widget icon(IconData data) => Icon(data, size: 18, color: context.theme.colors.mutedForeground);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: AppSpaces.spacing,
      children: [
        FTextField(
          control: .managed(controller: _email),
          label: Text(t.email),
          error: form.error == LoginError.codeNotSent ? Text(t.codeNotSent) : null,
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.email],
          prefixBuilder: (context, style, variants) =>
              FTextField.prefixIconBuilder(context, style, variants, icon(FLucideIcons.mail)),
          onSubmit: notifier.requestCode,
        ),
        FTextField(
          control: .managed(controller: _password),
          label: Text(t.password),
          error: form.error == LoginError.passwordRejected ? Text(t.passwordRejected) : null,
          obscureText: true,
          autofillHints: const [AutofillHints.password],
          prefixBuilder: (context, style, variants) =>
              FTextField.prefixIconBuilder(context, style, variants, icon(FLucideIcons.lock)),
          onSubmit: (password) => notifier.loginWithPassword(_email.text, password),
        ),
        FButton(
          variant: .outline,
          prefix: busy,
          onPress: form.busy ? null : () => notifier.loginWithPassword(_email.text, _password.text),
          child: Text(t.withPassword),
        ),
        FButton(
          size: .lg,
          prefix: busy,
          onPress: form.busy ? null : () => notifier.requestCode(_email.text),
          child: Text(t.sendCode),
        ),
      ],
    );
  }
}
