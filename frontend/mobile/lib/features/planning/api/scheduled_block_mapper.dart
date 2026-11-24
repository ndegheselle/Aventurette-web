import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/planning/api/event_mapper.dart';
import 'package:ajil/features/planning/models/scheduled_block.dart';

/// A `planned_blocks` record: who, its label, when it starts and when it ends, and the activity it
/// runs, if any. The label is the block's own, so nothing is expanded.
class ScheduledBlockMapper implements EntityMapper<ScheduledBlock> {
  const ScheduledBlockMapper();

  @override
  List<String> get relations => const [];

  @override
  ScheduledBlock toEntity(Payload payload, FileUrlResolver files) {
    final activity = payload['activity'] as String? ?? '';

    return ScheduledBlock(
      id: payload['id'] as String,
      user: payload['user'] as String,
      activityId: activity.isEmpty ? null : activity,
      label: payload['label'] as String? ?? '',
      start: localDate(payload['start']),
      end: localDate(payload['end']),
    );
  }

  @override
  Payload toPayload(ScheduledBlock block) => {
    'user': block.user,
    'activity': block.activityId ?? '',
    'label': block.label,
    'start': backendDate(block.start),
    'end': backendDate(block.end),
  };
}
