import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// A short message at the bottom of the screen, with an optional action — *Annuler*, to take back
/// what was just done. Needs the app's `FToaster` above [context].
void showToast(BuildContext context, String message, {String? actionLabel, VoidCallback? onAction}) {
  final hasAction = actionLabel != null && onAction != null;

  showFToast(
    context: context,
    title: Text(message),
    suffixBuilder: hasAction
        ? (context, entry) => FButton(
            size: .sm,
            mainAxisSize: MainAxisSize.min,
            onPress: () {
              entry.dismiss();
              onAction();
            },
            child: Text(actionLabel),
          )
        : null,
  );
}
