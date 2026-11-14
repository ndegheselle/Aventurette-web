import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// Shows a toast, the one way the app does: at the bottom of the screen, where the sheets open,
/// and dismissed by a swipe to the right. Where it sits is the toaster's, in `app.dart`; how it
/// leaves is set here, so no page picks its own.
///
/// [actionLabel] and [onAction] add a button to the toast — *Annuler* on a removal — which
/// closes the toast before it runs.
FToasterEntry showAppToast(
  BuildContext context, {
  required String title,
  String? description,
  IconData? icon,
  String? actionLabel,
  VoidCallback? onAction,
}) {
  assert((actionLabel == null) == (onAction == null), 'an action needs both a label and a callback');

  return showFToast(
    context: context,
    icon: icon == null ? null : Icon(icon),
    title: Text(title),
    description: description == null ? null : Text(description),
    swipeToDismiss: const [.right],
    suffixBuilder: onAction == null
        ? null
        : (toastContext, entry) => FButton(
            size: .sm,
            mainAxisSize: MainAxisSize.min,
            onPress: () {
              entry.dismiss();
              onAction();
            },
            child: Text(actionLabel!),
          ),
  );
}
