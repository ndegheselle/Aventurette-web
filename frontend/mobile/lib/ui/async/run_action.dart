import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';

/// Runs a button's async handler and says when it failed, so a page never holds a try/catch.
/// A call the backend cannot answer yet (`UnimplementedError`) says *Bientôt disponible*; any
/// other failure says [failure], or a generic message. Resolves to the result, or null when it
/// failed.
Future<T?> runAction<T>(BuildContext context, Future<T> Function() action, {String? failure}) async {
  final t = context.t.ui;

  try {
    return await action();
  } on UnimplementedError {
    if (context.mounted) showFToast(context: context, title: Text(t.comingSoon.title));
  } catch (_) {
    if (context.mounted) showFToast(context: context, title: Text(failure ?? t.errors.generic));
  }
  return null;
}
