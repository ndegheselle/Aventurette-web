import 'package:ajil/features/user/state/login_form.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// The login's second step: the code sent by email. Its six boxes match the backend's code
/// length (`users.OTP.Length` in backend/api/migrations).
class LoginCodeStep extends ConsumerStatefulWidget {
  const LoginCodeStep({super.key});

  @override
  ConsumerState<LoginCodeStep> createState() => _LoginCodeStepState();
}

class _LoginCodeStepState extends ConsumerState<LoginCodeStep> {
  final _code = FOtpController();

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.user.login;
    final form = ref.watch(loginFormProvider);
    final notifier = ref.read(loginFormProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: AppSpaces.spacing,
      children: [
        Text(t.codeSentTo(email: form.email), style: context.bodyText),
        FOtpField(
          control: .managed(controller: _code),
          label: Text(t.code),
          forceErrorText: form.error == LoginError.codeRejected ? t.codeRejected : null,
          keyboardType: TextInputType.number,
          autofocus: true,
          onSubmit: notifier.login,
        ),
        FButton(
          size: .lg,
          // A busy form takes no second press, and says it is working.
          prefix: form.busy ? const FCircularProgress() : null,
          onPress: form.busy ? null : () => notifier.login(_code.text),
          child: Text(t.title),
        ),
        FButton(variant: .ghost, onPress: notifier.changeEmail, child: Text(t.changeEmail)),
      ],
    );
  }
}
