import 'package:aventurette/app/i18n.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// Pager for a server-side list. Page numbers start at 1; `onPage` asks for another.
class Pagination extends StatelessWidget {
  const Pagination({
    super.key,
    required this.page,
    required this.perPage,
    required this.total,
    required this.onPage,
  });

  final int page;
  final int perPage;
  final int total;
  final ValueChanged<int> onPage;

  int get _totalPages => total == 0 ? 1 : (total / perPage).ceil();

  void _goTo(int target) {
    final clamped = target.clamp(1, _totalPages);
    if (clamped != page) onPage(clamped);
  }

  @override
  Widget build(BuildContext context) {
    final first = total == 0 ? 0 : (page - 1) * perPage + 1;
    final last = (page * perPage).clamp(0, total);

    return Row(
      children: [
        IconButton(
          tooltip: context.t('data.pagination.first'),
          icon: const Icon(LucideIcons.chevronFirst),
          onPressed: page <= 1 ? null : () => _goTo(1),
        ),
        IconButton(
          tooltip: context.t('data.pagination.previous'),
          icon: const Icon(LucideIcons.chevronLeft),
          onPressed: page <= 1 ? null : () => _goTo(page - 1),
        ),
        Text('$page / $_totalPages'),
        IconButton(
          tooltip: context.t('data.pagination.next'),
          icon: const Icon(LucideIcons.chevronRight),
          onPressed: page >= _totalPages ? null : () => _goTo(page + 1),
        ),
        IconButton(
          tooltip: context.t('data.pagination.last'),
          icon: const Icon(LucideIcons.chevronLast),
          onPressed: page >= _totalPages ? null : () => _goTo(_totalPages),
        ),
        const Spacer(),
        Text('$first - $last ${context.t('data.pagination.of')} $total'),
      ],
    );
  }
}
