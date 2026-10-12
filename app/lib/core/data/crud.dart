import 'package:aventurette/core/data/entity.dart';
import 'package:aventurette/core/data/filters.dart';

enum SortDirection {
  asc('+'),
  desc('-');

  const SortDirection(this.symbol);
  final String symbol;
}

/// Page numbers start at 1.
class PaginationOptions {
  const PaginationOptions({
    required this.page,
    required this.perPage,
    this.sortBy,
    this.sortDirection = SortDirection.asc,
  });

  final int page;
  final int perPage;
  final String? sortBy;
  final SortDirection sortDirection;

  PaginationOptions copyWith({int? page, int? perPage}) {
    return PaginationOptions(
      page: page ?? this.page,
      perPage: perPage ?? this.perPage,
      sortBy: sortBy,
      sortDirection: sortDirection,
    );
  }
}

class Paginated<T> {
  const Paginated({required this.items, required this.total, required this.options});

  final List<T> items;
  final int total;
  final PaginationOptions options;
}

abstract interface class DataCrud<TEntity extends BaseEntity> {
  /// Null when no record has that id.
  Future<TEntity?> getById(String id);
  Future<Paginated<TEntity>> filter(FilterGroup group, PaginationOptions options);
}

abstract interface class WritableCrud<TEntity extends BaseEntity> implements DataCrud<TEntity> {
  Future<TEntity> update(String id, TEntity entity);
}
