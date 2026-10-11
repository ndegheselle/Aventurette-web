import 'package:aventurette/features/activities/api/material.mapper.dart';
import 'package:aventurette/testing/testing.dart';
import 'package:flutter_test/flutter_test.dart';

final files = FakeFileUrls();

void main() {
  group('activityMaterialMapper', () {
    test('reads the link with the catalogue material\'s name folded in', () {
      final link = activityMaterialMapper.toEntity(
        aMaterialLinkPayload(name: 'Rope', quantity: 'one per team'),
        files,
      );

      expect(link.name, 'Rope');
      expect(link.quantity, 'one per team');
    });

    test('reads an unexpanded material as no name', () {
      final link = activityMaterialMapper.toEntity({'id': 'lnk1', 'material': 'cat1'}, files);

      expect(link.name, isEmpty);
    });
  });
}
