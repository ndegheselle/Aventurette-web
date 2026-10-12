import 'package:aventurette/ui/forms/use_validation_errors.dart';
import 'package:aventurette/ui/state/live_notifier.dart';
import 'package:flutter/foundation.dart';

/// Wraps a form submission: busy flag, cleared errors, and a rejection turned into field errors.
/// `submit` never throws — it resolves to whether the action succeeded.
///
/// [action] is what the form does; anything it throws is a rejected submission.
/// [defaultErrorKey] is the message shown when the backend sent no per-field detail.
class UseSubmit extends ChangeNotifier with LiveNotifier {
  UseSubmit(this._action, {String? defaultErrorKey})
    : errors = defaultErrorKey == null ? UseValidationErrors() : UseValidationErrors(defaultErrorKey);

  final Future<void> Function() _action;
  final UseValidationErrors errors;

  bool _isLoading = false;

  bool get isLoading => _isLoading;

  Future<bool> submit() async {
    _isLoading = true;
    errors.reset();
    notifyListeners();

    try {
      await _action();
      return true;
    } catch (error) {
      errors.set(error);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    errors.dispose();
    super.dispose();
  }
}
