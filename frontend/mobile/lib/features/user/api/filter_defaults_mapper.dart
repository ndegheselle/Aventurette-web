import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:ajil/features/user/models/user.dart';

/// PocketBase stores an empty number as 0, and no bound means anything by a 0: 0 is unset.
int? boundOf(Object? value) {
  final bound = (value as num?)?.toInt() ?? 0;
  return bound == 0 ? null : bound;
}

/// Reads a user record for its filter defaults, and nothing else of it.
class FilterDefaultsMapper implements EntityMapper<FilterDefaults> {
  const FilterDefaultsMapper();

  @override
  List<String> get relations => const [];

  @override
  FilterDefaults toEntity(Payload payload, FileUrlResolver files) => FilterDefaults(
    ageMin: boundOf(payload['defaultAgeMin']),
    ageMax: boundOf(payload['defaultAgeMax']),
    participantsMin: boundOf(payload['defaultParticipantsMin']),
    participantsMax: boundOf(payload['defaultParticipantsMax']),
    locations: enumsOf(Location.values, payload['defaultLocations']),
  );

  /// And back: an unset bound is stored as the 0 PocketBase would store anyway.
  @override
  Payload toPayload(FilterDefaults defaults) => {
    'defaultAgeMin': defaults.ageMin ?? 0,
    'defaultAgeMax': defaults.ageMax ?? 0,
    'defaultParticipantsMin': defaults.participantsMin ?? 0,
    'defaultParticipantsMax': defaults.participantsMax ?? 0,
    'defaultLocations': [for (final location in defaults.locations) constantOf(location)],
  };
}
