import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/planning/day_templates/models/day_template.dart';

/// PocketBase stores an empty number as 0: a time of 0 is unset.
int? _minutesOf(Object? value) {
  final minutes = (value as num?)?.toInt() ?? 0;
  return minutes == 0 ? null : minutes;
}

class DayTemplateMapper implements EntityMapper<DayTemplate> {
  const DayTemplateMapper();

  @override
  List<String> get relations => const [];

  @override
  DayTemplate toEntity(Payload payload, FileUrlResolver files) => DayTemplate(
    id: payload['id'] as String,
    owner: choiceOf(payload['owner']),
    name: (payload['name'] as String?) ?? '',
    summary: (payload['summary'] as String?) ?? '',
    startMinutes: _minutesOf(payload['startMinutes']),
    endMinutes: _minutesOf(payload['endMinutes']),
  );

  /// An unset time is written as the 0 PocketBase would store anyway; Ajil's owner as none.
  @override
  Payload toPayload(DayTemplate template) => {
    'owner': template.owner ?? '',
    'name': template.name,
    'summary': template.summary,
    'startMinutes': template.startMinutes ?? 0,
    'endMinutes': template.endMinutes ?? 0,
  };
}
