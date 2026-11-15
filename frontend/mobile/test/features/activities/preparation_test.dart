import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/preparation.dart';
import 'package:ajil/features/activities/models/step.dart';
import 'package:flutter_test/flutter_test.dart';

const _tip = StepTip(id: 't1', name: 'Rester visible', description: '');
const _other = StepTip(id: 't2', name: 'Compter les équipes', description: '');
const _scarves = ActivityMaterial(id: 'm1', name: 'Foulards', quantity: 'Un par équipe');

void main() {
  final preparation = preparationOf(
    const ActivityData(
      id: 'a',
      name: 'La quête du remède',
      steps: [
        ActivityStep(id: 's1', kind: StepKind.prepare, title: 'Délimiter le terrain', duration: 10),
        ActivityStep(id: 's2', kind: StepKind.custom, duration: 60, tips: [_tip]),
        ActivityStep(id: 's3', kind: StepKind.prepare, title: 'Cacher les indices', duration: 5, tips: [_other, _tip]),
      ],
      workshops: [
        ActivityWorkshop(id: 'w1', name: 'Le laboratoire', materials: [_scarves]),
        ActivityWorkshop(id: 'w2', name: 'Le marché'),
      ],
    ),
  );

  test('the set-up is the steps preparing the game, in order, and their time added up', () {
    expect(preparation.setup.map((step) => step.id), ['s1', 's3']);
    expect(preparation.setupMinutes, 15);
  });

  test("lists a workshop's material apart, and only for the workshops that need some", () {
    expect(preparation.workshops.map((group) => group.workshop), ['Le laboratoire']);
    expect(preparation.hasMaterials, isTrue);
  });

  test('gathers the tips of every step, each once, in first-use order', () {
    expect(preparation.tips.map((tip) => tip.id), ['t1', 't2']);
  });

  test('an activity with nothing to prepare has nothing in any tab', () {
    final empty = preparationOf(const ActivityData(id: 'b', name: 'B'));

    expect(empty.hasMaterials, isFalse);
    expect(empty.setup, isEmpty);
    expect(empty.hasAdvice, isFalse);
  });
}
