import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/features/user/composables/use_auth.dart';
import 'package:aventurette/features/user/composables/use_profile_settings.dart';
import 'package:aventurette/features/user/routes.dart';
import 'package:aventurette/ui/alerts/alerts.dart';
import 'package:aventurette/ui/forms/field_error.dart';
import 'package:aventurette/ui/layout/container.dart';
import 'package:aventurette/ui/layout/navbar.dart';
import 'package:aventurette/ui/layout/panel.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  late final UseProfileSettings _settings;

  @override
  void initState() {
    super.initState();
    _settings = UseProfileSettings(
      auth: UseAuth.shared,
      onSaved: () => showAlert(context, context.t('data.updated')),
    );
  }

  @override
  void dispose() {
    _settings.dispose();
    super.dispose();
  }

  void _logout() {
    UseAuth.shared.logout();
    context.goNamed(routesNames.login);
  }

  @override
  Widget build(BuildContext context) {
    final submit = _settings.submit;

    return NavbarTitle(
      title: context.t('user.settings.title'),
      child: PageContainer(
        children: [
          ListenableBuilder(
            listenable: Listenable.merge([submit, submit.errors]),
            builder: (context, _) {
              final nameError = submit.errors.keyOf('name');

              return Panel(
                children: [
                  Text(context.t('user.settings.profile'), style: Theme.of(context).textTheme.titleLarge),
                  TextFormField(
                    initialValue: _settings.email,
                    readOnly: true,
                    decoration: InputDecoration(labelText: context.t('user.settings.email')),
                  ),
                  TextFormField(
                    initialValue: _settings.form.name,
                    onChanged: (value) => _settings.form.name = value,
                    decoration: InputDecoration(
                      labelText: context.t('user.settings.name'),
                      errorText: nameError == null ? null : context.t(nameError),
                    ),
                  ),
                  FieldError(messageKey: submit.errors.globalKey),
                  FilledButton(
                    onPressed: submit.isLoading ? null : submit.submit,
                    child: Text(context.t('user.settings.save')),
                  ),
                ],
              );
            },
          ),
          OutlinedButton(onPressed: _logout, child: Text(context.t('auth.logout'))),
        ],
      ),
    );
  }
}
