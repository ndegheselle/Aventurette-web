import 'package:aventurette/core/core.dart';

/// Something the activity needs, with how much of it: the activity's link to a catalogue
/// material. `name` is the catalogue material's, carried along so a list of them reads as one.
/// The activity's steps and workshops recall these links, not the catalogue.
class ActivityMaterialData implements BaseEntity {
  const ActivityMaterialData({required this.id, required this.name, this.quantity = ''});

  @override
  final String id;
  final String name;

  /// Free text: "one per team" is a quantity too.
  final String quantity;
}
