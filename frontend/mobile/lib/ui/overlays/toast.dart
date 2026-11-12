import 'package:flutter/widgets.dart';
import 'package:remix/remix.dart';

/// A short message at the bottom of the screen, with an optional action — *Annuler*, to take back
/// what was just done. Needs the app's `RemixToastScope` above [context].
void showToast(BuildContext context, String message, {String? actionLabel, VoidCallback? onAction}) {
  final action = (actionLabel != null && onAction != null)
      ? RemixToastAction(label: actionLabel, onPressed: onAction)
      : null;

  RemixToastScope.maybeOf(context)?.showToast(RemixToastData(title: message, action: action));
}
