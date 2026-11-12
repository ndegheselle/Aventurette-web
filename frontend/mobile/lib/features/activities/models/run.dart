/// Where a run of an activity is.
library;

/// The step a run is at, from the route's 1-based `step`. A missing or unreadable one is the
/// first step, and one past either end is the nearest end.
int runStepIndexOf(String? param, int stepCount) {
  final position = int.tryParse(param ?? '');
  if (position == null) return 0;

  final last = stepCount > 0 ? stepCount - 1 : 0;
  return (position - 1).clamp(0, last);
}
