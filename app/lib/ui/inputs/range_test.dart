import 'package:aventurette/ui/inputs/range.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('rangeLabel', () {
    test('reads an unset range as any', () {
      expect(rangeLabel(null, null).key, 'inputs.range.any');
    });

    test('reads a range open on one side as from or up to', () {
      final from = rangeLabel(6, null);
      expect(from.key, 'inputs.range.from');
      expect(from.params, {'min': 6});

      final upTo = rangeLabel(null, 10);
      expect(upTo.key, 'inputs.range.upTo');
      expect(upTo.params, {'max': 10});
    });

    test('reads equal ends as exactly that', () {
      expect(rangeLabel(8, 8).key, 'inputs.range.exactly');
    });

    test('reads two ends as between', () {
      final label = rangeLabel(6, 10);

      expect(label.key, 'inputs.range.between');
      expect(label.params, {'min': 6, 'max': 10});
    });
  });
}
