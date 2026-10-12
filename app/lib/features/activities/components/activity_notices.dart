import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/features/activities/model/activity.dart';
import 'package:aventurette/ui/layout/html_text.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// An activity's safety instructions, as an icon button opening a dialog with every entry in
/// full. It shows only when there is something behind it.
class ActivityNotices extends StatelessWidget {
  const ActivityNotices({super.key, required this.safety});

  final List<SafetyInstructionData> safety;

  @override
  Widget build(BuildContext context) {
    if (safety.isEmpty) return const SizedBox.shrink();

    final title = context.t('activities.fields.safetyInstructions');

    return Tooltip(
      message: title,
      child: FilledButton.tonalIcon(
        icon: const Icon(LucideIcons.triangleAlert),
        label: Text('${safety.length}'),
        onPressed: () => showDialog<void>(
          context: context,
          builder: (context) => AlertDialog(
            title: Row(spacing: 8, children: [const Icon(LucideIcons.triangleAlert), Text(title)]),
            content: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                spacing: 12,
                children: [
                  for (final instruction in safety)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(instruction.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        HtmlText(instruction.description),
                      ],
                    ),
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: Text(context.t('actions.close'))),
            ],
          ),
        ),
      ),
    );
  }
}
