import 'package:ajil/backend/pocketbase/errors.dart';
import 'package:ajil/backend/pocketbase/filters.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/core/data/filters.dart';
import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/core/files/file_url_resolver.dart';
import 'package:pocketbase/pocketbase.dart';

class PocketBaseFileUrls implements FileUrlResolver {
  const PocketBaseFileUrls(this._client);

  final PocketBase _client;

  @override
  String urlOf(Map<String, dynamic> record, String fileName) =>
      _client.files.getURL(RecordModel(record), fileName).toString();
}

class PocketBaseCrudFactory implements CrudFactory {
  const PocketBaseCrudFactory(this._client);

  final PocketBase _client;

  @override
  DataCrud<T> of<T>(String collection, EntityMapper<T> mapper) => _PocketBaseCrud(_client, collection, mapper);
}

/// [DataCrud] over one PocketBase collection. The wire shape stops here: every record goes
/// through the mapper on the way out, and what to expand comes from the same mapper, so a
/// relation it reads is a relation the request asked for.
class _PocketBaseCrud<T> implements DataCrud<T> {
  _PocketBaseCrud(PocketBase client, String collection, this._mapper)
    : _collection = client.collection(collection),
      _files = PocketBaseFileUrls(client),
      _expand = _mapper.relations.isEmpty ? null : _mapper.relations.join(',');

  final RecordService _collection;
  final EntityMapper<T> _mapper;
  final FileUrlResolver _files;
  final String? _expand;

  T _toEntity(RecordModel record) => _mapper.toEntity(record.toJson(), _files);

  @override
  Future<T> create(T entity) async {
    final record = await mapErrors(() => _collection.create(body: _mapper.toPayload(entity), expand: _expand));
    return _toEntity(record);
  }

  @override
  Future<T> update(String id, Payload changes) async {
    final record = await mapErrors(() => _collection.update(id, body: changes, expand: _expand));
    return _toEntity(record);
  }

  @override
  Future<void> remove(String id) => mapErrors(() => _collection.delete(id));

  // PocketBase's `field+` and `field-` modifiers. Only the id comes back: nothing reads the rest.
  @override
  Future<void> link(String id, String field, List<String> ids) =>
      mapErrors(() => _collection.update(id, body: {'$field+': ids}, fields: 'id'));

  @override
  Future<void> unlink(String id, String field, List<String> ids) =>
      mapErrors(() => _collection.update(id, body: {'$field-': ids}, fields: 'id'));

  /// Null for an id with no record behind it: the port reads a missing record as data.
  @override
  Future<T?> getById(String id) async {
    try {
      return _toEntity(await _collection.getOne(id, expand: _expand));
    } on ClientException catch (error) {
      if (error.statusCode == notFound) return null;
      throw toValidationError(error) ?? error;
    }
  }

  @override
  Future<List<T>> getAll() async {
    final records = await mapErrors(() => _collection.getFullList(expand: _expand));
    return [for (final record in records) _toEntity(record)];
  }

  @override
  Future<Paginated<T>> filter(FilterGroup group, PageRequest request) async {
    final expression = filterExpressionOf(group);
    final result = await mapErrors(
      () => _collection.getList(
        page: request.page,
        perPage: request.perPage,
        expand: _expand,
        sort: request.sort,
        filter: expression.isEmpty ? null : expression,
      ),
    );
    return Paginated(items: [for (final record in result.items) _toEntity(record)], total: result.totalItems);
  }
}
