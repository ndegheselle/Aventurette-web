import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/model/material.dart';

/// One of the stations an activity runs in parallel, and how many adults it takes to hold it.
/// `materials` are the activity's own, recalled here.
class ActivityWorkshopData implements BaseEntity {
  const ActivityWorkshopData({
    required this.id,
    required this.name,
    this.theme = '',
    this.challenges = '',
    this.adultsRequired = 0,
    this.materials = const [],
  });

  @override
  final String id;
  final String name;
  final String theme;

  /// Rich text.
  final String challenges;
  final int adultsRequired;
  final List<ActivityMaterialData> materials;
}
