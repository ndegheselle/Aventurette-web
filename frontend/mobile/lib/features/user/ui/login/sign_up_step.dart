import 'package:ajil/features/user/routes.dart';
import 'package:ajil/features/user/state/login_form.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// The sign-up's first step: the name, and the email the code is sent to.
class SignUpStep extends ConsumerStatefulWidget {
  const SignUpStep({super.key});

  @override
  ConsumerState<SignUpStep> createState() => _SignUpStepState();
}

class _SignUpStepState extends ConsumerState<SignUpStep> {
  // Back from the code step, what was typed before is still there to correct.
  late final _name = TextEditingController(text: ref.read(loginFormProvider).name);
  late final _email = TextEditingController(text: ref.read(loginFormProvider).email);

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.user;
    final form = ref.watch(loginFormProvider);
    final notifier = ref.read(loginFormProvider.notifier);

    void signUp() => notifier.signUp(_name.text, _email.text);
    final emailError = switch (form.error) {
      LoginError.accountNotCreated => t.signUp.accountNotCreated,
      LoginError.codeNotSent => t.login.codeNotSent,
      _ => null,
    };
    Widget icon(IconData data) => Icon(data, size: 18, color: context.theme.colors.mutedForeground);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: AppSpaces.spacing,
      children: [
        FTextField(
          control: .managed(controller: _name),
          label: Text(t.signUp.name),
          autofillHints: const [AutofillHints.name],
          textCapitalization: TextCapitalization.words,
          prefixBuilder: (context, style, variants) =>
              FTextField.prefixIconBuilder(context, style, variants, icon(FLucideIcons.user)),
        ),
        FTextField(
          control: .managed(controller: _email),
          label: Text(t.login.email),
          error: emailError == null ? null : Text(emailError),
          keyboardType: TextInputType.emailAddress,
          autofillHints: const [AutofillHints.email],
          prefixBuilder: (context, style, variants) =>
              FTextField.prefixIconBuilder(context, style, variants, icon(FLucideIcons.mail)),
          onSubmit: (_) => signUp(),
        ),
        FButton(
          size: .lg,
          // A busy form takes no second press, and says it is working.
          prefix: form.busy ? const FCircularProgress() : null,
          onPress: form.busy ? null : signUp,
          child: Text(t.signUp.submit),
        ),
        FButton(variant: .ghost, onPress: () => context.go(UserRoutes.login), child: Text(t.signUp.toLogin)),
      ],
    );
  }
}
