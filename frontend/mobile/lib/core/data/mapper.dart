import 'package:ajil/core/files/file_url_resolver.dart';

/// A record as the backend sends it: its columns, and what an expanded read carries under
/// `expand`.
typedef Payload = Map<String, dynamic>;

/// Anything with an id, which is all a relation writes back.
abstract interface class Identified {
  String get id;
}

/// Translates one collection between the backend's payload and the app's entity. Every model
/// declares one, and it is the only place the two shapes meet: relations inlined and files
/// resolved on the way out, relation ids on the way in.
abstract interface class EntityMapper<T> {
  /// Relations [toEntity] reads out of the payload, as the paths the backend expands
  /// (`steps.materials` for a nested one). The data layer fetches exactly these, so the list and
  /// the mapper cannot drift apart.
  List<String> get relations;

  /// [files] resolves the payload's stored file names to urls — handed in rather than imported,
  /// so a mapper stays free of the backend.
  T toEntity(Payload payload, FileUrlResolver files);

  /// What a create sends. Updates send columns: see `DataCrud.update`.
  Payload toPayload(T entity);
}

/// A relation goes back as the ids of its records.
List<String> toIds(Iterable<Identified> records) => [for (final record in records) record.id];

/// The records of an expanded relation, read through [mapper]. A relation the read did not
/// expand is empty, never the ids the record carries. PocketBase expands a single relation as a
/// record and a multiple one as a list: both read as a list.
List<T> toEntities<T>(Payload payload, String relation, EntityMapper<T> mapper, FileUrlResolver files) {
  final expanded = (payload['expand'] as Map?)?[relation];
  final records = switch (expanded) {
    final List<dynamic> list => list,
    final Map<dynamic, dynamic> one => [one],
    _ => const [],
  };

  return [for (final record in records) mapper.toEntity(Payload.from(record as Map), files)];
}

/// A list column as Dart reads it: absent or null is empty.
List<String> stringsOf(Object? value) => [for (final item in (value as List?) ?? const []) item as String];

/// An optional choice as the backend stores it: none is the empty string.
String? choiceOf(Object? value) {
  final choice = value as String?;
  return (choice == null || choice.isEmpty) ? null : choice;
}

/// The backend spells a choice in CONSTANT_CASE; Dart names it in camelCase.
String constantOf(Enum value) => value.name.replaceAllMapped(RegExp('[A-Z]'), (match) => '_${match[0]}').toUpperCase();

/// The enum value the backend spelled [raw], or null for an unset or unknown one.
E? enumOf<E extends Enum>(List<E> values, Object? raw) {
  for (final value in values) {
    if (constantOf(value) == raw) return value;
  }
  return null;
}

/// A list of choices, dropping any value this version of the app does not know.
List<E> enumsOf<E extends Enum>(List<E> values, Object? raw) => [
  for (final item in (raw as List?) ?? const []) ?enumOf(values, item),
];
