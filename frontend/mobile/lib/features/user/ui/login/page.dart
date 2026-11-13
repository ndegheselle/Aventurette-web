import 'package:ajil/features/user/state/login_form.dart';
import 'package:ajil/features/user/ui/login/code_step.dart';
import 'package:ajil/features/user/ui/login/email_step.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// Signing in with a code sent by email. The router leaves this page once the session is set.
class LoginPage extends ConsumerWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t.user.login;
    final codeSent = ref.watch(loginFormProvider.select((form) => form.codeSent));
    final style = context.theme.cardStyle;

    return AppPage(
      header: const SizedBox.shrink(),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpaces.page),
          child: FCard(
            child: Padding(
              padding: style.padding,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                spacing: AppSpaces.spacing,
                children: [
                  Text('Ajil', style: context.titleText),
                  Text(t.title, style: context.headingText),
                  if (codeSent) const LoginCodeStep() else const LoginEmailStep(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
