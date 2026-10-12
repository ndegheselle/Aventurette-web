import 'package:aventurette/app/i18n.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

class PasswordInput extends StatefulWidget {
  const PasswordInput({super.key, required this.onChanged, required this.label, this.errorText});

  final ValueChanged<String> onChanged;
  final String label;
  final String? errorText;

  @override
  State<PasswordInput> createState() => _PasswordInputState();
}

class _PasswordInputState extends State<PasswordInput> {
  bool _revealed = false;

  @override
  Widget build(BuildContext context) {
    return TextField(
      onChanged: widget.onChanged,
      obscureText: !_revealed,
      decoration: InputDecoration(
        labelText: widget.label,
        errorText: widget.errorText,
        suffixIcon: IconButton(
          tooltip: context.t('inputs.password.reveal'),
          icon: Icon(_revealed ? LucideIcons.eyeOff : LucideIcons.eye),
          onPressed: () => setState(() => _revealed = !_revealed),
        ),
      ),
    );
  }
}
