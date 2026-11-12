import 'package:ajil/core/data/crud.dart';
import 'package:ajil/core/data/filters.dart';
import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';

/// Resolves a file to a url that says which record and file it is.
class FakeFiles implements FileUrlResolver {
  const FakeFiles();

  @override
  String urlOf(Map<String, dynamic> record, String fileName) => 'files/${record['id']}/$fileName';
}

/// One in-memory collection behind the [DataCrud] port: records are payloads, read back through
/// the mapper as the real adapter does. Filters compare with `=` only — enough for the specs —
/// and anything else is refused, so a spec cannot pass on a filter the fake ignored.
class FakeCrud<T> implements DataCrud<T> {
  FakeCrud(this.mapper, this.records, this.writes);

  final EntityMapper<T> mapper;

  /// The collection's records: shared by every [FakeCrud] reading it through another mapper.
  final List<Payload> records;

  /// Every write, in order: `create`, `update <id>`, `link <id> <field> <ids>`…
  final List<String> writes;

  T _read(Payload record) => mapper.toEntity(record, const FakeFiles());

  Payload? _find(String id) => records.where((record) => record['id'] == id).firstOrNull;

  @override
  Future<T> create(T entity) async {
    final record = {...mapper.toPayload(entity), 'id': 'new${records.length + 1}'};
    records.add(record);
    writes.add('create');
    return _read(record);
  }

  @override
  Future<T> update(String id, Payload changes) async {
    final record = _find(id) ?? (throw StateError('No record $id'));
    record.addAll(changes);
    writes.add('update $id');
    return _read(record);
  }

  @override
  Future<void> remove(String id) async {
    records.removeWhere((record) => record['id'] == id);
    writes.add('remove $id');
  }

  @override
  Future<void> link(String id, String field, List<String> ids) async {
    final record = _find(id) ?? (throw StateError('No record $id'));
    record[field] = [...stringsOf(record[field]), ...ids];
    writes.add('link $id $field ${ids.join(',')}');
  }

  @override
  Future<void> unlink(String id, String field, List<String> ids) async {
    final record = _find(id) ?? (throw StateError('No record $id'));
    record[field] = [
      for (final other in stringsOf(record[field]))
        if (!ids.contains(other)) other,
    ];
    writes.add('unlink $id $field ${ids.join(',')}');
  }

  @override
  Future<T?> getById(String id) async {
    final record = _find(id);
    return record == null ? null : _read(record);
  }

  @override
  Future<List<T>> getAll() async => [for (final record in records) _read(record)];

  @override
  Future<Paginated<T>> filter(FilterGroup group, PageRequest request) async {
    final matching = records.where((record) => _matches(record, group)).toList();
    final start = (request.page - 1) * request.perPage;
    final page = matching.skip(start).take(request.perPage);
    return Paginated(items: [for (final record in page) _read(record)], total: matching.length);
  }

  bool _matches(Payload record, FilterGroup group) => group.filters.every(
    (node) => switch (node) {
      final FilterGroup nested => _matches(record, nested),
      final Filter filter when filter.operator == FilterOperator.equals => record[filter.key] == filter.value,
      Filter() => throw UnsupportedError('FakeCrud filters with = only'),
    },
  );
}

/// Hands each collection to its specs, seeded from [seeds]. Two mappers over one collection —
/// `users` read for its favorites and for its filter defaults — share its records and writes.
class FakeCrudFactory implements CrudFactory {
  FakeCrudFactory([Map<String, List<Payload>> seeds = const {}])
    : records = {
        for (final MapEntry(:key, :value) in seeds.entries) key: [for (final record in value) Payload.from(record)],
      };

  final Map<String, List<Payload>> records;
  final writes = <String, List<String>>{};

  @override
  DataCrud<T> of<T>(String collection, EntityMapper<T> mapper) =>
      FakeCrud<T>(mapper, records.putIfAbsent(collection, () => []), writes.putIfAbsent(collection, () => []));
}
