import 'package:ajil/features/user/api/session_api.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum LoginError { codeNotSent, codeRejected }

/// The sign-in, in two steps: the email, to which a one-time code is sent, then that code. Each
/// step has its own error, so an error on one never shows on the other.
class LoginFormState {
  const LoginFormState({this.email = '', this.otpId, this.busy = false, this.error});

  final String email;

  /// Set once a code was sent: what the code is checked against.
  final String? otpId;
  final bool busy;
  final LoginError? error;

  bool get codeSent => otpId != null;
}

class LoginFormNotifier extends Notifier<LoginFormState> {
  @override
  LoginFormState build() => const LoginFormState();

  Future<void> requestCode(String email) async {
    state = LoginFormState(email: email, busy: true);
    try {
      final otpId = await ref.read(sessionApiProvider).requestOtp(email.trim());
      state = LoginFormState(email: email, otpId: otpId);
    } catch (_) {
      state = LoginFormState(email: email, error: LoginError.codeNotSent);
    }
  }

  /// Signs in. The router leaves the login once the session is set.
  Future<void> login(String code) async {
    final otpId = state.otpId;
    if (otpId == null) return;

    state = LoginFormState(email: state.email, otpId: otpId, busy: true);
    try {
      await ref.read(sessionProvider.notifier).loginWithOtp(otpId, code.trim());
      state = LoginFormState(email: state.email, otpId: otpId);
    } catch (_) {
      state = LoginFormState(email: state.email, otpId: otpId, error: LoginError.codeRejected);
    }
  }

  /// Back to the email step, to correct it or have a new code sent.
  void changeEmail() => state = LoginFormState(email: state.email);
}

final loginFormProvider = NotifierProvider.autoDispose<LoginFormNotifier, LoginFormState>(LoginFormNotifier.new);
