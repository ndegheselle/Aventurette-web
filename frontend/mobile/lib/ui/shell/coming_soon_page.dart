import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:flutter/widgets.dart';

/// The route target of a screen that is not built yet: its header, so the app can be walked
/// through as designed, and *Bientôt disponible* in place of its content. [wireframe] is the
/// screen's id in the Figma file.
class ComingSoonPage extends StatelessWidget {
  const ComingSoonPage({super.key, required this.title, required this.wireframe, this.isTab = false});

  final String title;
  final String wireframe;

  /// A dock tab's page: the large title and the shell's actions, rather than a back button.
  final bool isTab;

  @override
  Widget build(BuildContext context) {
    return AppPage(
      header: isTab ? TabHeader(title: title) : BackHeader(title: title),
      body: ComingSoonView(wireframe: wireframe),
    );
  }
}
