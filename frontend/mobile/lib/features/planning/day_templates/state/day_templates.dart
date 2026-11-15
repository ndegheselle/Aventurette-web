import 'package:ajil/features/planning/day_templates/api/day_templates_api.dart';
import 'package:ajil/features/planning/day_templates/models/day_template.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// What the *Journées types* (B03) list is asked for: whose templates, and the search.
class DayTemplatesQuery {
  const DayTemplatesQuery({this.source = TemplateSource.ajil, this.search = ''});

  final TemplateSource source;
  final String search;
}

class DayTemplatesQueryNotifier extends Notifier<DayTemplatesQuery> {
  @override
  DayTemplatesQuery build() => const DayTemplatesQuery();

  void show(TemplateSource source) => state = DayTemplatesQuery(source: source, search: state.search);

  void search(String search) => state = DayTemplatesQuery(source: state.source, search: search);
}

final dayTemplatesQueryProvider = NotifierProvider<DayTemplatesQueryNotifier, DayTemplatesQuery>(
  DayTemplatesQueryNotifier.new,
);

final dayTemplatesProvider = FutureProvider.autoDispose<List<DayTemplate>>((ref) {
  final query = ref.watch(dayTemplatesQueryProvider);
  return ref.read(dayTemplatesApiProvider).of(query.source, ref.watch(currentUserIdProvider), query.search);
});
