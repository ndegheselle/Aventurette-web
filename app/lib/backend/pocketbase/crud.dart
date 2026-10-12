import 'package:aventurette/backend/pocketbase/errors.dart';
import 'package:aventurette/backend/pocketbase/files.dart';
import 'package:aventurette/backend/pocketbase/filters.dart';
import 'package:aventurette/core/core.dart';
import 'package:pocketbase/pocketbase.dart';

/// DataCrud backed by one PocketBase collection. Every record goes through the model's mapper on
/// the way out, and every write through it on the way in. What to expand comes from the same
/// mapper, so a relation it reads is a relation the request asked for.
class PocketBaseCrud<TEntity extends BaseEntity> implements DataCrud<TEntity> {
  PocketBaseCrud(PocketBase client, String collection, this._mapper)
    : _service = client.collection(collection),
      _files = PocketBaseFileUrls(client),
      _expand = _mapper.relations.isEmpty ? null : _mapper.relations.join(',');

  final RecordService _service;
  final EntityMapper<TEntity> _mapper;
  final PocketBaseFileUrls _files;
  final String? _expand;

  TEntity _toEntity(RecordModel record) => _mapper.toEntity(record.toJson(), _files);

  @override
  Future<TEntity?> getById(String id) async {
    try {
      return _toEntity(await _service.getOne(id, expand: _expand));
    } on ClientException catch (error) {
      if (error.statusCode == notFound) return null;
      final validation = toValidationError(error);
      if (validation != null) throw validation;
      rethrow;
    }
  }

  @override
  Future<Paginated<TEntity>> filter(FilterGroup group, PaginationOptions options) async {
    final expression = filterGroupToPocketBase(group);
    final sortBy = options.sortBy;

    final result = await mapErrors(
      () => _service.getList(
        page: options.page,
        perPage: options.perPage,
        expand: _expand,
        sort: sortBy == null ? null : '${options.sortDirection.symbol}$sortBy',
        filter: expression.isEmpty ? null : expression,
      ),
    );

    return Paginated(items: result.items.map(_toEntity).toList(), total: result.totalItems, options: options);
  }
}

/// A collection the app also writes to.
class PocketBaseWritableCrud<TEntity extends BaseEntity> extends PocketBaseCrud<TEntity>
    implements WritableCrud<TEntity> {
  PocketBaseWritableCrud(super.client, super.collection, WritableMapper<TEntity> super.mapper);

  @override
  Future<TEntity> update(String id, TEntity entity) async {
    final body = (_mapper as WritableMapper<TEntity>).toPayload(entity);
    final record = await mapErrors(() => _service.update(id, body: body, expand: _expand));
    return _toEntity(record);
  }
}
