import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/planning/events/models/event.dart';

/// A date as PocketBase stores and compares it: UTC, with a space between the day and the time.
String backendDate(DateTime moment) => moment.toUtc().toIso8601String().replaceFirst('T', ' ');

/// A stored date, in the device's time.
DateTime localDate(Object? value) => DateTime.parse(value as String).toLocal();

class EventMapper implements EntityMapper<PlanningEvent> {
  const EventMapper();

  @override
  List<String> get relations => const [];

  @override
  PlanningEvent toEntity(Payload payload, FileUrlResolver files) => PlanningEvent(
    id: payload['id'] as String,
    owner: payload['owner'] as String,
    name: (payload['name'] as String?) ?? '',
    start: localDate(payload['start']),
    end: localDate(payload['end']),
    place: (payload['place'] as String?) ?? '',
    overnight: (payload['overnight'] as bool?) ?? false,
    group: (payload['group'] as String?) ?? '',
    status: enumOf(EventStatus.values, payload['status']),
  );

  @override
  Payload toPayload(PlanningEvent event) => {
    'owner': event.owner,
    'name': event.name,
    'start': backendDate(event.start),
    'end': backendDate(event.end),
    'place': event.place,
    'overnight': event.overnight,
    'group': event.group,
    'status': event.status == null ? '' : constantOf(event.status!),
  };
}
