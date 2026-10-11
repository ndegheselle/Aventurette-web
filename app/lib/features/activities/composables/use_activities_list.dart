import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/api/activities.api.dart';
import 'package:aventurette/features/activities/model/activity.dart';
import 'package:aventurette/ui/inputs/range.dart';
import 'package:aventurette/ui/state/live_notifier.dart';
import 'package:flutter/foundation.dart';

const defaultPerPage = 25;

/// What each card shows beside the activity: the ages it is for and how long it takes.
typedef ActivityCard = ({ActivityData activity, RangeLabel ageLabel, int totalMinutes});

/// The public activity list. Read-only — writing an activity is the authoring feature's, which
/// lists the author's own rather than everybody's.
class UseActivitiesList extends ChangeNotifier with LiveNotifier {
  UseActivitiesList({DataCrud<ActivityData>? api}) : _api = api ?? activitiesApi;

  final DataCrud<ActivityData> _api;

  Paginated<ActivityData> paginated = const Paginated(
    items: [],
    total: 0,
    options: PaginationOptions(page: 1, perPage: defaultPerPage),
  );
  String search = '';

  List<ActivityCard> get cards {
    return [
      for (final activity in paginated.items)
        (activity: activity, ageLabel: _ageLabelOf(activity), totalMinutes: totalMinutesOf(activity)),
    ];
  }

  RangeLabel _ageLabelOf(ActivityData activity) {
    final ages = ageRangeOf(activity.audience);
    return rangeLabel(ages.min, ages.max);
  }

  /// Re-query the current page.
  Future<void> refresh() async {
    final group = createSearchFilter(search, const ['name', 'description']);
    paginated = await _api.filter(group, paginated.options);
    notifyListeners();
  }

  /// A new search starts from the first page: the current one may not exist in its results.
  Future<void> searchFor(String text) {
    search = text;
    paginated = Paginated(
      items: paginated.items,
      total: paginated.total,
      options: paginated.options.copyWith(page: 1),
    );
    return refresh();
  }

  Future<void> goToPage(int page) {
    paginated = Paginated(
      items: paginated.items,
      total: paginated.total,
      options: paginated.options.copyWith(page: page),
    );
    return refresh();
  }
}
