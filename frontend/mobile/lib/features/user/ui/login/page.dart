import 'package:ajil/features/user/state/login_form.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// Signing in with a code sent by email. The router leaves this page once the session is set.
/// A debug build also offers a password under the email, to sign in without a mailbox.
class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _email = TextEditingController();
  final _code = TextEditingController();
  final _password = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    _code.dispose();
    _password.dispose();
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
      LoginError.passwordRejected => t.passwordRejected,
      null => null,
    };

    // Each error belongs to the one field that caused it, and shows under it.
    Widget? errorFor(LoginError cause) => form.error == cause && error != null ? Text(error) : null;
    // A busy form takes no second press, and says it is working.
    final busy = form.busy ? const FCircularProgress() : null;

    Widget icon(IconData data) => Icon(data, size: 18, color: context.theme.colors.mutedForeground);

    final steps = form.codeSent
        ? [
            Text(t.codeSentTo(email: form.email), style: context.bodyText),
            FTextField(
              control: .managed(controller: _code),
              label: Text(t.code),
              error: errorFor(LoginError.codeRejected),
              keyboardType: TextInputType.number,
              autofillHints: const [AutofillHints.oneTimeCode],
              prefixBuilder: (context, style, variants) =>
                  FTextField.prefixIconBuilder(context, style, variants, icon(FLucideIcons.keyRound)),
              onSubmit: notifier.login,
            ),
            FButton(
              size: .lg,
              prefix: busy,
              onPress: form.busy ? null : () => notifier.login(_code.text),
              child: Text(t.title),
            ),
            FButton(
              variant: .ghost,
              onPress: () {
                _code.clear();
                notifier.changeEmail();
              },
              child: Text(t.changeEmail),
            ),
          ]
        : [
            FTextField(
              control: .managed(controller: _email),
              label: Text(t.email),
              error: errorFor(LoginError.codeNotSent),
              keyboardType: TextInputType.emailAddress,
              autofillHints: const [AutofillHints.email],
              prefixBuilder: (context, style, variants) =>
                  FTextField.prefixIconBuilder(context, style, variants, icon(FLucideIcons.mail)),
              onSubmit: notifier.requestCode,
            ),
            FButton(
              size: .lg,
              prefix: busy,
              onPress: form.busy ? null : () => notifier.requestCode(_email.text),
              child: Text(t.sendCode),
            ),
            if (kDebugMode) ...[
              FTextField(
                control: .managed(controller: _password),
                label: Text(t.password),
                error: errorFor(LoginError.passwordRejected),
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
            ],
          ];

    return AppPage(
      header: const SizedBox(height: 32),
      body: PageScroll(
        children: [
          Text('Ajil', style: context.titleText),
          Text(t.title, style: context.headingText),
          ...steps,
        ],
      ),
    );
  }
}
