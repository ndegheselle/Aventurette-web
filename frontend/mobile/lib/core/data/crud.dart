import 'package:ajil/core/data/filters.dart';
import 'package:ajil/core/data/mapper.dart';

/// Page numbers start at 1. [sort] is a column, `-` in front for descending.
class PageRequest {
  const PageRequest({required this.page, required this.perPage, this.sort});

  final int page;
  final int perPage;
  final String? sort;
}

class Paginated<T> {
  const Paginated({required this.items, required this.total});

  final List<T> items;
  final int total;
}

/// One collection, read and written through its mapper.
abstract interface class DataCrud<T> {
  Future<T> create(T entity);

  /// [changes] are columns, as the backend stores them: Dart has no partial type to say "some
  /// fields of T", and only `api/`, which knows the columns, calls this.
  Future<T> update(String id, Payload changes);

  Future<void> remove(String id);

  /// Add ids to a list field of one record, or take them off, sending only those ids: the rest
  /// of the list is neither read nor written, so two changes made at once both land.
  Future<void> link(String id, String field, List<String> ids);
  Future<void> unlink(String id, String field, List<String> ids);

  /// Null when no record has that id.
  Future<T?> getById(String id);
  Future<List<T>> getAll();
  Future<Paginated<T>> filter(FilterGroup group, PageRequest request);
}

/// Builds a [DataCrud] for one collection. Wired once; each `api/` asks it for its own.
abstract interface class CrudFactory {
  DataCrud<T> of<T>(String collection, EntityMapper<T> mapper);
}
