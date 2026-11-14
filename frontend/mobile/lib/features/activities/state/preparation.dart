import 'package:flutter_riverpod/flutter_riverpod.dart';

/// The material ticked on an activity's *Préparation* (A05), by material link id. Kept while the
/// app runs, so going back to the sheet and in again keeps the ticks; never written anywhere:
/// ticking material changes no stock.
class PreparationChecklist extends Notifier<Set<String>> {
  PreparationChecklist(this.activityId);

  final String activityId;

  @override
  Set<String> build() => const {};

  void toggle(String materialId) => state = state.contains(materialId)
      ? {
          for (final id in state)
            if (id != materialId) id,
        }
      : {...state, materialId};
}

final preparationChecklistProvider = NotifierProvider.family<PreparationChecklist, Set<String>, String>(
  PreparationChecklist.new,
);
