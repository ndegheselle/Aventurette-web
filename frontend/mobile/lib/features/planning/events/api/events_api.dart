import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/core/data/filters.dart';
import 'package:ajil/features/planning/events/api/event_mapper.dart';
import 'package:ajil/features/planning/events/models/event.dart';
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

  /// The user's events whose name matches [search], in the order they start.
  Future<List<PlanningEvent>> mine(String owner, String search) async {
    final found = await _events.filter(
      FilterGroup([
        Filter('owner', owner, operator: FilterOperator.equals),
        if (search.isNotEmpty) searchFilter(search, ['name']),
      ]),
      const PageRequest(page: 1, perPage: _limit, sort: 'start'),
    );
    return found.items;
  }

  /// Who sees a shared event is not decided, and there is nothing to share them with yet.
  Future<List<PlanningEvent>> shared(String search) => throw UnimplementedError('Shared events (B02)');
}

final eventsApiProvider = Provider(
  (ref) => EventsApi(ref.watch(crudFactoryProvider).of('events', const EventMapper())),
);
