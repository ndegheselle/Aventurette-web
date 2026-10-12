import 'package:flutter/foundation.dart';

/// A notifier that goes quiet once disposed. A request outlives its screen — a login that
/// navigates away, a page left mid-load — and its result must not reach a notifier that is gone.
mixin LiveNotifier on ChangeNotifier {
  bool _disposed = false;

  @override
  void notifyListeners() {
    if (!_disposed) super.notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
