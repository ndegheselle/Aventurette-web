import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/composables/use_activity.dart';
import 'package:aventurette/features/activities/model/activity.dart';
import 'package:aventurette/features/activities/model/play.dart';
import 'package:aventurette/ui/state/live_notifier.dart';
import 'package:flutter/foundation.dart';

/// Running one activity: its steps one at a time, and the actions ticked along the way. A run
/// lives in memory only — leaving the screen, or loading another activity, starts it over.
class UseActivityPlay extends ChangeNotifier with LiveNotifier {
  UseActivityPlay({DataCrud<ActivityData>? api}) : source = UseActivity(api: api) {
    source.addListener(_onActivityChanged);
  }

  final UseActivity source;

  List<PlayStep> steps = const [];
  int index = 0;
  final _ticked = <String>{};

  Future<void> load(String id) => source.load(id);

  void _onActivityChanged() {
    steps = playStepsOf(source.activity);
    index = 0;
    _ticked.clear();
    notifyListeners();
  }

  PlayStep? get current => index < steps.length ? steps[index] : null;
  bool get isFirst => index == 0;
  bool get isLast => index >= steps.length - 1;

  /// Move to a step, staying within the run.
  void goTo(int target) {
    final lastIndex = steps.isEmpty ? 0 : steps.length - 1;
    index = target.clamp(0, lastIndex);
    notifyListeners();
  }

  void previous() => goTo(index - 1);
  void next() => goTo(index + 1);

  bool isTicked(PlayStep step, int actionIndex) => _ticked.contains(actionKey(step, actionIndex));

  void toggle(PlayStep step, int actionIndex) {
    final key = actionKey(step, actionIndex);
    if (!_ticked.remove(key)) _ticked.add(key);
    notifyListeners();
  }

  @override
  void dispose() {
    source.dispose();
    super.dispose();
  }
}
