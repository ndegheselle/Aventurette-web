import 'package:aventurette/features/user/composables/use_auth.dart';
import 'package:aventurette/ui/forms/use_submit.dart';

/// The registration form's state and what submitting it does. The confirmation is checked by the
/// backend, which answers `validation_values_mismatch` on `passwordConfirm` — shown like any
/// other field error.
class UseRegisterForm {
  UseRegisterForm({required UseAuth auth, required void Function() onRegistered}) {
    submit = UseSubmit(() async {
      await auth.register(email, password, passwordConfirm);
      onRegistered();
    });
  }

  String email = '';
  String password = '';
  String passwordConfirm = '';

  late final UseSubmit submit;

  void dispose() => submit.dispose();
}
