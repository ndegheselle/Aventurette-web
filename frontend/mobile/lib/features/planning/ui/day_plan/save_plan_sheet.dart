import 'package:ajil/features/planning/ui/calendar_dates.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/sheet.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// Asks which day the plan is for, on a calendar opened on [initial]. Resolves to that day, a
/// local midnight, or null when closed.
Future<DateTime?> askPlanDay(BuildContext context, {required DateTime initial}) {
  final t = context.t.planning.plan;
  var chosen = toCalendarDate(initial);

  return showAppSheet<DateTime>(
    context,
    title: t.saveTitle,
    builder: (_) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: AppSpaces.spacing,
      children: [
        Text(t.saveHint, style: context.captionText),
        StatefulBuilder(
          builder: (context, setState) => Center(
            child: FCalendar.grid(
              control: FGridCalendarControl(initial: chosen),
              selectionControl: .liftedSingle(
                value: chosen,
                toggleable: false,
                onChange: (date) {
                  if (date != null) setState(() => chosen = date);
                },
              ),
            ),
          ),
        ),
      ],
    ),
    actionsBuilder: (sheetContext) => FButton(
      prefix: const Icon(FLucideIcons.save),
      onPress: () => Navigator.of(sheetContext).pop(fromCalendarDate(chosen)),
      child: Text(t.saveConfirm),
    ),
  );
}
