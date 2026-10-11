import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/features/activities/model/step.dart';
import 'package:aventurette/ui/layout/html_text.dart';
import 'package:flutter/material.dart';

/// A step as the detail screen lists it: its number, title, duration and description.
class StepSummary extends StatelessWidget {
  const StepSummary({super.key, required this.index, required this.step});

  final int index;
  final ActivityStepData step;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      spacing: 12,
      children: [
        Text(stepNumber(index), style: theme.textTheme.headlineMedium?.copyWith(color: theme.disabledColor)),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (step.title.isNotEmpty || step.duration > 0)
                Wrap(
                  spacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    if (step.title.isNotEmpty)
                      Text(step.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                    if (step.duration > 0)
                      Text(
                        context.t('activities.minutes', {'minutes': step.duration}),
                        style: theme.textTheme.bodySmall,
                      ),
                  ],
                ),
              HtmlText(step.description),
            ],
          ),
        ),
      ],
    );
  }
}
