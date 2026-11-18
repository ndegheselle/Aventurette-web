import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// The frame of the login and the sign-up: the app's name, [title], then [child], in a card
/// centred on an otherwise empty page.
class AuthCard extends StatelessWidget {
  const AuthCard({super.key, required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
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
                  Text(title, style: context.headingText),
                  child,
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
