import 'package:ajil/features/activities/state/feedback.dart';
import 'package:flutter_test/flutter_test.dart';

import '../../support/container.dart';
import '../../support/fake_crud.dart';

void main() {
  test('a like and a comment end in one feedback record: the second write updates what the first created', () async {
    final crud = FakeCrudFactory();
    final container = await signedInContainer(crud: crud);
    final provider = feedbackProvider('a1');
    container.listen(provider, (_, _) {});
    await container.read(provider.future);

    await container.read(provider.notifier).toggleLike();
    await container.read(provider.notifier).saveComment('Super');

    final records = crud.records['user_activity_feedback']!;
    expect(records, hasLength(1));
    expect(records.single, containsPair('liked', true));
    expect(records.single, containsPair('comment', 'Super'));
    expect(crud.writes['user_activity_feedback'], ['create', 'update new1']);
  });

  test('a feedback from an earlier run is updated, not added to', () async {
    final crud = FakeCrudFactory({
      'user_activity_feedback': [
        {'id': 'f1', 'user': 'u1', 'activity': 'a1', 'liked': false, 'comment': ''},
      ],
    });
    final container = await signedInContainer(crud: crud);
    final provider = feedbackProvider('a1');
    container.listen(provider, (_, _) {});
    await container.read(provider.future);

    await container.read(provider.notifier).toggleLike();

    expect(crud.writes['user_activity_feedback'], ['update f1']);
  });

  test('a second tap while the first write is in flight creates no second record', () async {
    final crud = FakeCrudFactory();
    final container = await signedInContainer(crud: crud);
    final provider = feedbackProvider('a1');
    container.listen(provider, (_, _) {});
    await container.read(provider.future);

    final notifier = container.read(provider.notifier);
    await Future.wait([notifier.toggleLike(), notifier.toggleLike()]);

    expect(crud.records['user_activity_feedback'], hasLength(1));
  });

  test('a comment that did not change is not written', () async {
    final crud = FakeCrudFactory({
      'user_activity_feedback': [
        {'id': 'f1', 'user': 'u1', 'activity': 'a1', 'liked': true, 'comment': 'Super'},
      ],
    });
    final container = await signedInContainer(crud: crud);
    final provider = feedbackProvider('a1');
    container.listen(provider, (_, _) {});
    await container.read(provider.future);

    await container.read(provider.notifier).saveComment(' Super ');

    expect(crud.writes['user_activity_feedback'], isEmpty);
  });
}
