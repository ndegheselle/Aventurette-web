import 'package:ajil/features/user/api/session_api.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum LoginError { accountNotCreated, passwordTooShort, passwordsDiffer, codeNotSent, codeRejected, passwordRejected }

/// The sign-in, in two steps: the email, to which a one-time code is sent, then that code. The
/// sign-up has the same two, its first also taking a name and a password, typed twice. Each step
/// has its own error, so an error on one never shows on the other.
class LoginFormState {
  const LoginFormState({this.name = '', this.email = '', this.otpId, this.busy = false, this.error});

  /// Typed at the sign-up only.
  final String name;
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

  SessionApi get _api => ref.read(sessionApiProvider);

  Future<void> requestCode(String email) async {
    state = LoginFormState(email: email, busy: true);
    await _sendCode();
  }

  /// Creates the account, then sends the code that verifies its email and signs in. Nothing is
  /// created for a password too short or not confirmed, and nothing is sent for an account that
  /// could not be created. The password is kept as typed: spaces are part of it.
  Future<void> signUp(String name, String email, String password, String confirmation) async {
    final problem = passwordProblem(password, confirmation);
    if (problem != null) {
      state = LoginFormState(
        name: name,
        email: email,
        error: switch (problem) {
          PasswordProblem.tooShort => LoginError.passwordTooShort,
          PasswordProblem.mismatch => LoginError.passwordsDiffer,
        },
      );
      return;
    }

    state = LoginFormState(name: name, email: email, busy: true);
    try {
      await _api.signUp(email.trim(), name.trim(), password);
    } catch (_) {
      state = LoginFormState(name: name, email: email, error: LoginError.accountNotCreated);
      return;
    }
    await _sendCode();
  }

  Future<void> _sendCode() async {
    final LoginFormState(:name, :email) = state;
    try {
      final otpId = await _api.requestOtp(email.trim());
      state = LoginFormState(name: name, email: email, otpId: otpId);
    } catch (_) {
      state = LoginFormState(name: name, email: email, error: LoginError.codeNotSent);
    }
  }

  /// Signs in. The router leaves the login once the session is set.
  Future<void> login(String code) async {
    final LoginFormState(:name, :email, :otpId) = state;
    if (otpId == null) return;

    state = LoginFormState(name: name, email: email, otpId: otpId, busy: true);
    try {
      await ref.read(sessionProvider.notifier).loginWithOtp(otpId, code.trim());
      state = LoginFormState(name: name, email: email, otpId: otpId);
    } catch (_) {
      state = LoginFormState(name: name, email: email, otpId: otpId, error: LoginError.codeRejected);
    }
  }

  /// Signs in with a password, from the email step. Debug builds only.
  Future<void> loginWithPassword(String email, String password) async {
    state = LoginFormState(email: email, busy: true);
    try {
      await ref.read(sessionProvider.notifier).loginWithPassword(email.trim(), password);
      state = LoginFormState(email: email);
    } catch (_) {
      state = LoginFormState(email: email, error: LoginError.passwordRejected);
    }
  }

  /// Back to the first step, to correct it or have a new code sent.
  void changeEmail() => state = LoginFormState(name: state.name, email: state.email);
}

final loginFormProvider = NotifierProvider.autoDispose<LoginFormNotifier, LoginFormState>(LoginFormNotifier.new);
