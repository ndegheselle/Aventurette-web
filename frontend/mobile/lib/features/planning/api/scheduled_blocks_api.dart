import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/core/data/filters.dart';
import 'package:ajil/features/planning/api/event_mapper.dart';
import 'package:ajil/features/planning/api/scheduled_block_mapper.dart';
import 'package:ajil/features/planning/models/scheduled_block.dart';
import 'package:riverpod/riverpod.dart';

/// A user's blocks saved on the planning. The `planned_blocks` rules keep each to its user.
class ScheduledBlocksApi {
  const ScheduledBlocksApi(this._scheduled);

  final DataCrud<ScheduledBlock> _scheduled;

  /// As many as one screen lists.
  static const _limit = 200;

  /// The user's blocks taking part of [from, until), in the order they start.
  Future<List<ScheduledBlock>> between(String user, DateTime from, DateTime until) async {
    final found = await _scheduled.filter(
      FilterGroup([
        Filter('user', user, operator: FilterOperator.equals),
        Filter('start', backendDate(until), operator: FilterOperator.lessThan),
        Filter('end', backendDate(from), operator: FilterOperator.greaterThan),
      ]),
      const PageRequest(page: 1, perPage: _limit, sort: 'start'),
    );
    return found.items;
  }

  /// Creates [blocks], all at once.
  Future<void> createAll(List<ScheduledBlock> blocks) =>
      Future.wait([for (final block in blocks) _scheduled.create(block)]);
}

final scheduledBlocksApiProvider = Provider(
  (ref) => ScheduledBlocksApi(ref.watch(crudFactoryProvider).of('planned_blocks', const ScheduledBlockMapper())),
);
