import 'dart:async';

import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

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
            Expanded(child: Text(label, style: context.labelText)),
            if (trailing != null) Text(trailing!, style: context.captionText),
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
    final label = widget.label;
    final field = FTextField(
      control: .managed(controller: _controller, onChange: (value) => _changed(value.text)),
      label: label == null ? null : Text(label),
      hint: widget.hintText ?? context.t.ui.search,
      textInputAction: TextInputAction.search,
      prefixBuilder: (context, style, variants) =>
          FTextField.prefixIconBuilder(context, style, variants, const Icon(FLucideIcons.search)),
      onSubmit: (value) {
        _debounce?.cancel();
        widget.onSearch(value.trim());
      },
    );

    return label == null ? Semantics(label: context.t.ui.search, child: field) : field;
  }
}
