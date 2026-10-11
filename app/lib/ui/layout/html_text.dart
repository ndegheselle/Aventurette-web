import 'package:flutter/widgets.dart';
import 'package:flutter_widget_from_html_core/flutter_widget_from_html_core.dart';

/// Rich text as the backend stores it (HTML).
class HtmlText extends StatelessWidget {
  const HtmlText(this.html, {super.key});

  final String html;

  @override
  Widget build(BuildContext context) => HtmlWidget(html);
}
