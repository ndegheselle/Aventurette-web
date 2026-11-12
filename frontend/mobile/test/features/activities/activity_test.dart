import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/models/favorites.dart';
import 'package:ajil/features/activities/models/feedback.dart';
import 'package:ajil/features/activities/models/run.dart';
import 'package:ajil/features/activities/models/step.dart';
import 'package:flutter_test/flutter_test.dart';

ActivityStep step(String id, StepKind kind, {int duration = 0, List<StepResource> resources = const []}) =>
    ActivityStep(id: id, kind: kind, duration: duration, resources: resources);

void main() {
  test('preparation is the steps preparing the game, play every other step, and no duration counts as 0', () {
    final timing = timingOf(
      ActivityData(
        id: 'a',
        name: 'A',
        steps: [
          step('1', StepKind.prepare, duration: 15),
          step('2', StepKind.custom, duration: 60),
          step('3', StepKind.conclusion),
        ],
      ),
    );

    expect((timing.preparation, timing.play, timing.total), (15, 60, 75));
  });

  test('gathers the resources of every step, each once, in first-use order', () {
    const shared = StepResource(id: 'r1', name: 'Carte', url: '');
    const other = StepResource(id: 'r2', name: 'Indice', url: '');

    final resources = resourcesOf(
      ActivityData(
        id: 'a',
        name: 'A',
        steps: [
          step('1', StepKind.custom, resources: [shared]),
          step('2', StepKind.custom, resources: [other, shared]),
        ],
      ),
    );

    expect(resources.map((resource) => resource.id), ['r1', 'r2']);
  });

  test("a resource's picture is its url when that is an image, query string or not", () {
    expect(pictureOf(const StepResource(id: 'r', name: '', url: 'f/a.JPG?thumb=1')), 'f/a.JPG?thumb=1');
    expect(pictureOf(const StepResource(id: 'r', name: '', url: 'f/a.pdf')), isEmpty);
  });

  group('where a run is', () {
    test('reads the 1-based step as an index', () => expect(runStepIndexOf('2', 5), 1));
    test('starts at the first step with no step or an unreadable one', () {
      expect(runStepIndexOf(null, 5), 0);
      expect(runStepIndexOf('deux', 5), 0);
    });
    test('goes to the nearest end past either end', () {
      expect(runStepIndexOf('9', 5), 4);
      expect(runStepIndexOf('0', 5), 0);
    });
  });

  test('an activity added twice is in the favorites once', () {
    const activity = ActivityData(id: 'a', name: 'A');
    expect(withFavorite(withFavorite(const [], activity), activity), hasLength(1));
  });

  group('the comment to save', () {
    test('is what was typed, trimmed', () => expect(commentToSave('', '  bien  '), 'bien'));
    test('is nothing when it is what is saved already', () => expect(commentToSave('bien', 'bien '), isNull));
    test('is empty when the field is emptied, taking the comment back', () => expect(commentToSave('bien', ''), ''));
  });
}
