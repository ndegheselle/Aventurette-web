import 'package:ajil/features/user/state/login_form.dart';
import 'package:ajil/features/user/ui/login/auth_card.dart';
import 'package:ajil/features/user/ui/login/code_step.dart';
import 'package:ajil/features/user/ui/login/sign_up_step.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Creating an account: a name, an email and a password, then the code sent to the email, which
/// verifies it and signs in. The router leaves this page once the session is set.
class SignUpPage extends ConsumerWidget {
  const SignUpPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final codeSent = ref.watch(loginFormProvider.select((form) => form.codeSent));

    return AuthCard(title: context.t.user.signUp.title, child: codeSent ? const LoginCodeStep() : const SignUpStep());
  }
}
