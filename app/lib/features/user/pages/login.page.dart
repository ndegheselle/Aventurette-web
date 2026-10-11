import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/features/user/composables/use_auth.dart';
import 'package:aventurette/features/user/composables/use_login_form.dart';
import 'package:aventurette/features/user/routes.dart';
import 'package:aventurette/ui/forms/field_error.dart';
import 'package:aventurette/ui/forms/password_input.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  late final UseLoginForm _form;

  @override
  void initState() {
    super.initState();
    _form = UseLoginForm(auth: UseAuth.shared, onSignedIn: () => context.go('/'));
  }

  @override
  void dispose() {
    _form.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final submit = _form.submit;

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 360),
          child: ListenableBuilder(
            listenable: Listenable.merge([submit, submit.errors]),
            builder: (context, _) => Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              spacing: 12,
              children: [
                Text(context.t('auth.login.title'), style: Theme.of(context).textTheme.headlineSmall),
                TextField(
                  keyboardType: TextInputType.emailAddress,
                  onChanged: (value) => _form.email = value,
                  decoration: InputDecoration(
                    labelText: context.t('auth.form.email'),
                    errorText: _errorOf(context, 'email'),
                  ),
                ),
                PasswordInput(
                  onChanged: (value) => _form.password = value,
                  label: context.t('auth.form.password'),
                  errorText: _errorOf(context, 'password'),
                ),
                FieldError(messageKey: submit.errors.globalKey),
                FilledButton(
                  onPressed: submit.isLoading ? null : submit.submit,
                  child: Text(context.t('auth.login.title')),
                ),
                TextButton(
                  onPressed: () => context.goNamed(routesNames.register),
                  child: Text(context.t('auth.form.accountNew')),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String? _errorOf(BuildContext context, String field) {
    final key = _form.submit.errors.keyOf(field);
    return key == null ? null : context.t(key);
  }
}
