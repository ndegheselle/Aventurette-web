import 'dart:async';

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/app_theme.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

/// A label above any input, and an optional value at the end of the label's line.
class LabeledField extends StatelessWidget {
  const LabeledField({super.key, required this.label, required this.child, this.trailing});

  final String label;
  final Widget child;
  final String? trailing;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: 6,
      children: [
        Row(
          children: [
            Expanded(child: StyledText(label, style: labelText())),
            if (trailing != null) StyledText(trailing!, style: captionText()),
          ],
        ),
        child,
      ],
    );
  }
}

/// A labelled search, reporting what is typed once typing has settled.
class SearchField extends StatefulWidget {
  const SearchField({super.key, required this.onSearch, this.label, this.hintText});

  final ValueChanged<String> onSearch;
  final String? label;
  final String? hintText;

  @override
  State<SearchField> createState() => _SearchFieldState();
}

class _SearchFieldState extends State<SearchField> {
  static const _settle = Duration(milliseconds: 300);

  final _controller = TextEditingController();
  Timer? _debounce;

  void _changed(String value) {
    _debounce?.cancel();
    _debounce = Timer(_settle, () => widget.onSearch(value.trim()));
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final field = RemixTextField(
      controller: _controller,
      hintText: widget.hintText ?? context.t.ui.search,
      semanticLabel: widget.label ?? context.t.ui.search,
      textInputAction: TextInputAction.search,
      leading: Icon(LucideIcons.search, size: 18, color: context.muted),
      onChanged: _changed,
      onSubmitted: (value) {
        _debounce?.cancel();
        widget.onSearch(value.trim());
      },
      style: textFieldStyle(),
    );

    final label = widget.label;
    return label == null ? field : LabeledField(label: label, child: field);
  }
}
