import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/api/activities.api.dart';
import 'package:aventurette/features/activities/model/activity.dart';
import 'package:aventurette/features/activities/model/step.dart';
import 'package:aventurette/ui/inputs/range.dart';
import 'package:aventurette/ui/state/live_notifier.dart';
import 'package:flutter/foundation.dart';

/// One activity, loaded by id. `load` again with another id when the screen is reused for it.
class UseActivity extends ChangeNotifier with LiveNotifier {
  UseActivity({DataCrud<ActivityData>? api}) : _api = api ?? activitiesApi;

  final DataCrud<ActivityData> _api;

  ActivityData? activity;

  /// Whether a load is under way. `activity` still null once it is over means there is none.
  bool isLoading = true;

  Future<void> load(String id) async {
    isLoading = true;
    activity = null;
    notifyListeners();

    try {
      activity = await _api.getById(id);
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  RangeLabel get ageLabel {
    final ages = ageRangeOf(activity?.audience ?? const ActivityAudience());
    return rangeLabel(ages.min, ages.max);
  }

  RangeLabel get participantsLabel {
    final participants = participantsRangeOf(activity?.audience ?? const ActivityAudience());
    return rangeLabel(participants.min, participants.max);
  }

  List<ActivityResourceData> get resources {
    final current = activity;
    return current == null ? const [] : resourcesOf(current);
  }

  ActivityTiming get timing {
    final current = activity;
    return current == null ? (preparation: 0, play: 0) : timingOf(current);
  }
}
