import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/core/data/filters.dart';
import 'package:ajil/features/planning/api/event_mapper.dart';
import 'package:ajil/features/planning/models/event.dart';
import 'package:riverpod/riverpod.dart';

/// A user's events. The `events` rules keep each to its owner.
class EventsApi {
  const EventsApi(this._events);

  final DataCrud<PlanningEvent> _events;

  /// As many as one screen lists: a user plans tens of events a year, not thousands.
  static const _limit = 200;

  /// The user's events taking part of [from, until), in the order they start.
  Future<List<PlanningEvent>> between(String owner, DateTime from, DateTime until) async {
    final found = await _events.filter(
      FilterGroup([
        Filter('owner', owner, operator: FilterOperator.equals),
        Filter('start', backendDate(until), operator: FilterOperator.lessThan),
        Filter('end', backendDate(from), operator: FilterOperator.greaterOrEquals),
      ]),
      const PageRequest(page: 1, perPage: _limit, sort: 'start'),
    );
    return found.items;
  }
}

final eventsApiProvider = Provider(
  (ref) => EventsApi(ref.watch(crudFactoryProvider).of('events', const EventMapper())),
);
