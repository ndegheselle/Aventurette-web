import 'package:flutter/widgets.dart';

/// The title the navbar shows. A page passing one holds it until it unmounts; the layout reads it.
final navbarTitle = ValueNotifier<String?>(null);

/// Wraps a page to give the navbar its title.
class NavbarTitle extends StatefulWidget {
  const NavbarTitle({super.key, required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  State<NavbarTitle> createState() => _NavbarTitleState();
}

class _NavbarTitleState extends State<NavbarTitle> {
  @override
  void initState() {
    super.initState();
    // After the frame: the navbar is mid-build when a page mounts.
    WidgetsBinding.instance.addPostFrameCallback((_) => navbarTitle.value = widget.title);
  }

  @override
  void didUpdateWidget(NavbarTitle oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.title != widget.title) {
      WidgetsBinding.instance.addPostFrameCallback((_) => navbarTitle.value = widget.title);
    }
  }

  @override
  void dispose() {
    // Only if it is still ours: the next page may already have set its own.
    final title = widget.title;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (navbarTitle.value == title) navbarTitle.value = null;
    });
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
