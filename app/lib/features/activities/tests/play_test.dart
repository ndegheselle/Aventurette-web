import 'package:aventurette/features/activities/model/play.dart';
import 'package:aventurette/features/activities/model/step.dart';
import 'package:aventurette/testing/testing.dart';
import 'package:flutter_test/flutter_test.dart';

List<String> keysOf(List<PlayStep> steps) => steps.map((step) => step.key).toList();

void main() {
  group('playStepsOf', () {
    test('has no step for no activity', () {
      expect(playStepsOf(null), isEmpty);
    });

    test('gathers the material first, each material an action with its quantity', () {
      final activity = anActivity(
        materials: [
          aMaterial(name: 'Rope', quantity: '2'),
          aMaterial(id: 'lnk2', name: 'Ball'),
        ],
        steps: [aStep(id: 's1', kind: StepKind.prepare)],
      );

      final steps = playStepsOf(activity);

      expect(steps.first.generatedKind, GeneratedStepKind.gatherMaterial);
      expect(steps.first.actions, ['Rope — 2', 'Ball']);
    });

    test('has no gathering of material when the activity needs none', () {
      final steps = playStepsOf(anActivity(steps: [aStep(id: 's1')]));

      expect(steps.any((step) => step.generatedKind == GeneratedStepKind.gatherMaterial), isFalse);
    });

    test('gathers the children before the first step not preparing the game', () {
      final activity = anActivity(
        steps: [
          aStep(id: 'prep1', kind: StepKind.prepare),
          aStep(id: 'prep2', kind: StepKind.prepare),
          aStep(id: 'play', kind: StepKind.custom),
        ],
      );

      expect(keysOf(playStepsOf(activity)), ['prep1', 'prep2', 'GATHER_CHILDREN', 'play']);
    });

    test('gathers the children first when nothing is prepared', () {
      final activity = anActivity(steps: [aStep(id: 'play')]);

      expect(keysOf(playStepsOf(activity)), ['GATHER_CHILDREN', 'play']);
    });

    test('does not gather the children when every step prepares the game', () {
      final activity = anActivity(
        steps: [aStep(id: 'prep', kind: StepKind.prepare)],
      );

      expect(keysOf(playStepsOf(activity)), ['prep']);
    });

    test('leaves a preparation step written later where it is', () {
      final activity = anActivity(
        steps: [
          aStep(id: 'play'),
          aStep(id: 'late-prep', kind: StepKind.prepare),
        ],
      );

      expect(keysOf(playStepsOf(activity)), ['GATHER_CHILDREN', 'play', 'late-prep']);
    });

    test('puts the material before the children, whatever the order of the steps', () {
      final activity = anActivity(
        materials: [aMaterial()],
        steps: [aStep(id: 'play')],
      );

      expect(keysOf(playStepsOf(activity)), ['GATHER_MATERIAL', 'GATHER_CHILDREN', 'play']);
    });
  });
}
