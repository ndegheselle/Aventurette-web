import 'package:aventurette/core/core.dart';
import 'package:aventurette/ui/state/live_notifier.dart';
import 'package:flutter/foundation.dart';

/// Field errors from a rejected write. Feed a caught error to `set`, read the translation key of
/// a field's message with `keyOf`, and show `globalKey` when the backend sent no per-field detail.
class UseValidationErrors extends ChangeNotifier with LiveNotifier {
  UseValidationErrors([this.defaultErrorKey = 'validation.errors.default']);

  /// Translation key of the global message.
  final String defaultErrorKey;

  FieldErrors _fields = const {};
  String? _globalKey;

  String? get globalKey => _globalKey;

  /// Translation key of the field's message, or null when the field has no error.
  String? keyOf(String field) {
    final code = _fields[field];
    return code == null ? null : 'validation.errors.$code';
  }

  void set(Object error) {
    // Adapters normalise a rejected write into ValidationError; anything else has no field detail.
    _fields = error is ValidationError ? error.fields : const {};
    _globalKey = defaultErrorKey;
    notifyListeners();
  }

  void reset() {
    _fields = const {};
    _globalKey = null;
    notifyListeners();
  }
}
