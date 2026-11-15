import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/core/data/filters.dart';
import 'package:ajil/features/planning/day_templates/api/day_template_mapper.dart';
import 'package:ajil/features/planning/day_templates/models/day_template.dart';
import 'package:riverpod/riverpod.dart';

/// Day templates. The `day_templates` rules let a user read Ajil's and their own.
class DayTemplatesApi {
  const DayTemplatesApi(this._templates);

  final DataCrud<DayTemplate> _templates;

  static const _limit = 200;

  /// The templates of [source] whose name or summary matches [search], by name. Structures do
  /// not exist yet, so neither do their templates.
  Future<List<DayTemplate>> of(TemplateSource source, String userId, String search) async {
    final owner = switch (source) {
      TemplateSource.ajil => '',
      TemplateSource.personal => userId,
      TemplateSource.structure => throw UnimplementedError("A structure's day templates (B03)"),
    };
    final found = await _templates.filter(
      FilterGroup([
        Filter('owner', owner, operator: FilterOperator.equals),
        if (search.isNotEmpty) searchFilter(search, ['name', 'summary']),
      ]),
      const PageRequest(page: 1, perPage: _limit, sort: 'name'),
    );
    return found.items;
  }
}

final dayTemplatesApiProvider = Provider(
  (ref) => DayTemplatesApi(ref.watch(crudFactoryProvider).of('day_templates', const DayTemplateMapper())),
);
