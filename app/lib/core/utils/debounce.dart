import 'dart:async';

/// Calls `action` once, `delay` after the last call.
class Debouncer {
  Debouncer([this.delay = const Duration(milliseconds: 300)]);

  final Duration delay;
  Timer? _timer;

  void run(void Function() action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }

  void dispose() => _timer?.cancel();
}
