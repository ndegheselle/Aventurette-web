import 'package:ajil/features/user/state/login_form.dart';
import 'package:ajil/features/user/ui/login/auth_card.dart';
import 'package:ajil/features/user/ui/login/code_step.dart';
import 'package:ajil/features/user/ui/login/email_step.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Signing in with a code sent by email, or with a password. The router leaves this page once the
/// session is set.
class LoginPage extends ConsumerWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final codeSent = ref.watch(loginFormProvider.select((form) => form.codeSent));

    return AuthCard(
      title: context.t.user.login.title,
      child: codeSent ? const LoginCodeStep() : const LoginEmailStep(),
    );
  }
}
