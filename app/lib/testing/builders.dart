import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/activities/model/activity.dart';
import 'package:aventurette/features/activities/model/material.dart';
import 'package:aventurette/features/activities/model/step.dart';
import 'package:aventurette/features/user/model/user.dart';

/// Builders fill a complete, valid record and take an override for the field a test is about.

JsonMap anActivityPayload([JsonMap overrides = const {}]) {
  return {'id': 'act1', 'name': 'Treasure hunt', 'state': 'PUBLISHED', ...overrides};
}

JsonMap aStepPayload([JsonMap overrides = const {}]) {
  return {
    'id': 'stp1',
    'kind': 'CUSTOM',
    'title': 'Hide the treasure',
    'description': '<p>Hide it</p>',
    ...overrides,
  };
}

JsonMap aMaterialPayload([JsonMap overrides = const {}]) {
  return {'id': 'mat1', 'name': 'Rope', ...overrides};
}

/// An activity's link to a catalogue material, the material expanded.
JsonMap aMaterialLinkPayload({String id = 'lnk1', String name = 'Rope', String quantity = ''}) {
  return {
    'id': id,
    'quantity': quantity,
    'material': 'cat-$id',
    'expand': {
      'material': aMaterialPayload({'id': 'cat-$id', 'name': name}),
    },
  };
}

JsonMap aResourcePayload([JsonMap overrides = const {}]) {
  return {'id': 'res1', 'name': 'Rules', 'file': 'rules.pdf', ...overrides};
}

JsonMap aTagPayload([JsonMap overrides = const {}]) {
  return {'id': 'tag1', 'name': 'Forest', 'type': 'THEME', ...overrides};
}

JsonMap aSafetyInstructionPayload([JsonMap overrides = const {}]) {
  return {'id': 'saf1', 'name': 'Fire', 'description': '<p>Keep away</p>', ...overrides};
}

ActivityStepData aStep({
  String id = 'stp1',
  StepKind kind = StepKind.custom,
  int duration = 0,
  List<String> actions = const [],
  List<ActivityResourceData> resources = const [],
}) {
  return ActivityStepData(id: id, kind: kind, duration: duration, actions: actions, resources: resources);
}

ActivityMaterialData aMaterial({String id = 'lnk1', String name = 'Rope', String quantity = ''}) {
  return ActivityMaterialData(id: id, name: name, quantity: quantity);
}

ActivityData anActivity({
  List<ActivityStepData> steps = const [],
  List<ActivityMaterialData> materials = const [],
}) {
  return ActivityData(id: 'act1', name: 'Treasure hunt', steps: steps, materials: materials);
}

UserData aUser({Role role = Role.user}) {
  return UserData(id: 'usr1', email: 'ada@example.com', name: 'Ada', role: role);
}
