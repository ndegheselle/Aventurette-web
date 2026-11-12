import 'package:ajil/features/user/state/session.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/inputs/fields.dart';
import 'package:ajil/ui/overlays/sheet.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// *Mon compte* (E04): who is signed in, and signing out — what the web's settings held. Editing
/// the name, the accesses and the account's security are not built yet.
class AccountPage extends ConsumerWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = context.t;
    final user = ref.watch(sessionProvider).value;

    Future<void> logout() async {
      final confirmed = await showAppSheet<bool>(
        context,
        title: t.user.account.logout,
        builder: (_) => Text(t.user.account.logoutConfirm, style: context.bodyText),
        actionsBuilder: (sheetContext) => FButton(
          variant: .destructive,
          size: .lg,
          onPress: () => Navigator.of(sheetContext).pop(true),
          child: Text(t.user.account.logout),
        ),
      );
      // The router sends a signed-out user to the login.
      if (confirmed ?? false) await ref.read(sessionProvider.notifier).logout();
    }

    return AppPage(
      header: BackHeader(title: t.user.account.title),
      body: PageScroll(
        children: [
          if (user != null && user.name.isNotEmpty)
            LabeledField(
              label: t.user.account.name,
              child: Panel(child: Text(user.name, style: context.bodyText)),
            ),
          if (user != null)
            LabeledField(
              label: t.user.account.email,
              child: Panel(child: Text(user.email, style: context.bodyText)),
            ),
          Center(
            child: FButton(
              variant: .outline,
              mainAxisSize: MainAxisSize.min,
              onPress: logout,
              child: Text(t.user.account.logout),
            ),
          ),
        ],
      ),
    );
  }
}
