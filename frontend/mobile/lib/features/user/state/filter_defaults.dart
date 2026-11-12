import 'package:ajil/features/user/api/filter_defaults_api.dart';
import 'package:ajil/features/user/models/user.dart';
import 'package:ajil/features/user/state/session.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// The filter defaults, for the onboarding and the preferences: read from the user record, edited
/// in place, saved back. Either way the user counts as onboarded after, and the session is read
/// again so the router knows. Where to go next is the screen's.
class FilterDefaultsNotifier extends AsyncNotifier<FilterDefaults> {
  FilterDefaultsApi get _api => ref.read(filterDefaultsApiProvider);
  String get _userId => ref.read(currentUserIdProvider);

  @override
  Future<FilterDefaults> build() => ref.read(filterDefaultsApiProvider).of(ref.watch(currentUserIdProvider));

  void edit(FilterDefaults defaults) => state = AsyncData(defaults);

  Future<void> save() async {
    final defaults = state.value;
    if (defaults == null) return;

    await _api.save(_userId, defaults);
    await ref.read(sessionProvider.notifier).reload();
  }

  Future<void> skip() async {
    await _api.skip(_userId);
    await ref.read(sessionProvider.notifier).reload();
  }
}

final filterDefaultsProvider = AsyncNotifierProvider<FilterDefaultsNotifier, FilterDefaults>(
  FilterDefaultsNotifier.new,
);
