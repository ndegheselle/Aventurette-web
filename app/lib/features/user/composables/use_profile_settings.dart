import 'package:aventurette/features/user/api/profile.api.dart';
import 'package:aventurette/features/user/composables/use_auth.dart';
import 'package:aventurette/features/user/model/user.dart';
import 'package:aventurette/ui/forms/use_submit.dart';

/// The settings page: the signed-in user's profile as a form, and saving it.
class UseProfileSettings {
  UseProfileSettings({required this.auth, required void Function() onSaved})
    : form = toProfileForm(auth.current),
      email = auth.current?.email ?? '' {
    submit = UseSubmit(() async {
      final user = auth.current;
      if (user == null) return;

      await profileApi.update(user.id, withProfile(user, form));
      // The session holds a copy of the user: read it again so the app shows the new name.
      await auth.refresh();
      onSaved();
    });
  }

  final UseAuth auth;
  final ProfileForm form;
  final String email;

  late final UseSubmit submit;

  void dispose() => submit.dispose();
}
