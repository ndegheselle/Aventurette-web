import 'package:aventurette/features/activities/api/step.mapper.dart';
import 'package:aventurette/features/activities/model/step.dart';
import 'package:aventurette/testing/testing.dart';
import 'package:flutter_test/flutter_test.dart';

final files = FakeFileUrls();

void main() {
  group('stepMapper', () {
    test('reads its relations out of expand', () {
      final step = stepMapper.toEntity(
        aStepPayload({
          'expand': {
            'materials': [aMaterialLinkPayload(name: 'Rope', quantity: '2')],
            'resources': [aResourcePayload()],
            'tips': [
              {'id': 'tip1', 'name': 'Whisper'},
            ],
          },
        }),
        files,
      );

      expect(step.materials.single.quantity, '2');
      expect(step.resources.single.name, 'Rules');
      expect(step.tips.single.name, 'Whisper');
    });

    test('reads an unexpanded relation as empty', () {
      final step = stepMapper.toEntity(
        aStepPayload({
          'materials': ['lnk1'],
          'resources': ['res1'],
          'tips': ['tip1'],
        }),
        files,
      );

      expect(step.materials, isEmpty);
      expect(step.resources, isEmpty);
      expect(step.tips, isEmpty);
    });

    test('reads actions never set as none', () {
      expect(stepMapper.toEntity(aStepPayload({'actions': null}), files).actions, isEmpty);
      expect(stepMapper.toEntity(aStepPayload(), files).actions, isEmpty);
    });

    test('reads a kind it does not know as a free step', () {
      expect(stepMapper.toEntity(aStepPayload({'kind': 'FUTURE'}), files).kind, StepKind.custom);
    });
  });

  group('resourceMapper', () {
    test('turns the stored file name into a url', () {
      final resource = resourceMapper.toEntity(aResourcePayload({'id': 'res9', 'file': 'map.png'}), files);

      expect(resource.url, 'url:res9/map.png');
    });

    test('has no url for a record without a file', () {
      final resource = resourceMapper.toEntity(aResourcePayload({'file': ''}), files);

      expect(resource.url, isEmpty);
    });
  });
}
