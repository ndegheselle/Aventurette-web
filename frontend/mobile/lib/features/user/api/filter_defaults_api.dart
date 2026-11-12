import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:ajil/features/user/api/filter_defaults_mapper.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:riverpod/riverpod.dart';

/// The filter defaults are fields of the user record. The `users` rules keep it to its owner.
class FilterDefaultsApi {
  const FilterDefaultsApi(this._users);

  static const _mapper = FilterDefaultsMapper();

  final DataCrud<FilterDefaults> _users;

  Future<FilterDefaults> of(String userId) async => (await _users.getById(userId)) ?? const FilterDefaults();

  /// Saving them, or putting them off, counts as having seen the onboarding.
  Future<void> save(String userId, FilterDefaults defaults) =>
      _users.update(userId, {..._mapper.toPayload(defaults), 'onboarded': true});

  /// The onboarding's *Plus tard*: shown once all the same, nothing chosen.
  Future<void> skip(String userId) => _users.update(userId, {'onboarded': true});
}

final filterDefaultsApiProvider = Provider(
  (ref) => FilterDefaultsApi(ref.watch(crudFactoryProvider).of('users', FilterDefaultsApi._mapper)),
);
