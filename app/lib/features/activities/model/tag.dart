import 'package:aventurette/core/core.dart';

enum ActivityTagType implements WireEnum {
  theme('THEME'),
  imaginary('IMAGINARY'),
  goal('GOAL'),
  idealFor('IDEAL_FOR'),
  developPhysical('DEVELOP_PHYSICAL'),
  developIntellectual('DEVELOP_INTELLECTUAL'),
  developAffect('DEVELOP_AFFECT'),
  developSocial('DEVELOP_SOCIAL'),
  developMoral('DEVELOP_MORAL'),
  developSpiritual('DEVELOP_SPIRITUAL');

  const ActivityTagType(this.wire);

  @override
  final String wire;
}

/// A tag an activity can carry: a theme, an imaginary universe, a pedagogical goal, a use it is
/// ideal for or a developmental keyword, told apart by `type`. Tags are reference data — an
/// activity links them, it never writes them. `name` is in French whatever the app's locale.
class ActivityTagData implements BaseEntity {
  const ActivityTagData({required this.id, required this.name, required this.type});

  @override
  final String id;
  final String name;

  /// Null for a kind this app does not know yet.
  final ActivityTagType? type;
}
