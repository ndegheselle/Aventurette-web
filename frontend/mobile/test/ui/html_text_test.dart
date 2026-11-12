import 'package:ajil/core/range.dart';
import 'package:ajil/ui/content/html_text.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('rich text as plain text', () {
    test('starts a line at each block and line break, and drops empty ones', () {
      expect(plainTextOf('<p>Un</p><p></p><p>Deux<br>Trois</p>'), 'Un\nDeux\nTrois');
    });

    test('bullets list items and drops every other tag', () {
      expect(plainTextOf('<ul><li><strong>Foulards</strong></li><li>Ciseaux</li></ul>'), '• Foulards\n• Ciseaux');
    });

    test('decodes the entities the editor writes', () {
      expect(plainTextOf('Jeux&nbsp;calmes &amp; ballons'), 'Jeux calmes & ballons');
    });
  });

  group('a range', () {
    const bounds = RangeBounds(floor: 0, ceiling: 18);

    test('reads an end back at its edge as unset', () {
      expect((lowValue(bounds, 0), highValue(bounds, 18)), (null, null));
      expect((lowValue(bounds, 3), highValue(bounds, 12)), (3, 12));
    });

    test('words itself from its ends', () {
      expect(RangeLabel.of(null, null), isA<AnyRange>());
      expect(RangeLabel.of(4, 4), isA<ExactRange>());
      expect(RangeLabel.of(null, 6), isA<UpToRange>());
      expect(RangeLabel.of(3, 6), isA<BetweenRange>());
    });
  });
}
