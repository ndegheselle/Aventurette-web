import 'package:aventurette/app/i18n.dart';
import 'package:flutter/material.dart';

/// The form's own message, shown when the backend sent no detail for any field.
class FieldError extends StatelessWidget {
  const FieldError({super.key, required this.messageKey});

  final String? messageKey;

  @override
  Widget build(BuildContext context) {
    final key = messageKey;
    if (key == null) return const SizedBox.shrink();

    return Text(context.t(key), style: TextStyle(color: Theme.of(context).colorScheme.error));
  }
}
