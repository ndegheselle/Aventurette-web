import 'package:aventurette/features/user/composables/use_auth.dart';
import 'package:aventurette/ui/forms/use_submit.dart';

/// The login form's state and what submitting it does. `onSignedIn` says where to go next.
class UseLoginForm {
  UseLoginForm({required UseAuth auth, required void Function() onSignedIn}) {
    submit = UseSubmit(() async {
      await auth.login(email, password);
      onSignedIn();
    }, defaultErrorKey: 'auth.login.defaultError');
  }

  String email = '';
  String password = '';

  late final UseSubmit submit;

  void dispose() => submit.dispose();
}
