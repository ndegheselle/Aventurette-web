import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';

const _entities = {'&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'"};

/// The text of the rich text the editor stores, as plain paragraphs: a block or a line break
/// starts a new line, a list item a bullet, and every other tag is dropped. Formatting (bold,
/// links) is lost — see "Not finished" in the activities doc.
String plainTextOf(String html) {
  var text = html
      .replaceAll(RegExp(r'<br\s*/?>', caseSensitive: false), '\n')
      .replaceAll(RegExp(r'<li[^>]*>', caseSensitive: false), '\n• ')
      .replaceAll(RegExp(r'</(p|div|h[1-6]|li|ul|ol)>', caseSensitive: false), '\n')
      .replaceAll(RegExp(r'<[^>]+>'), '');

  for (final MapEntry(:key, :value) in _entities.entries) {
    text = text.replaceAll(key, value);
  }

  return text.split('\n').map((line) => line.trim()).where((line) => line.isNotEmpty).join('\n');
}

/// Rich text from the editor, shown as plain text. Nothing when it is empty.
class HtmlText extends StatelessWidget {
  const HtmlText(this.html, {super.key, this.style});

  final String html;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    final text = plainTextOf(html);
    if (text.isEmpty) return const SizedBox.shrink();

    return Text(text, style: style ?? context.bodyText);
  }
}
