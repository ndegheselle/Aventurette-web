import 'package:ajil/core/range.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  const bounds = RangeBounds(floor: 1, ceiling: 10);

  test('every whole value survives the trip to a track position and back', () {
    for (var value = bounds.floor; value <= bounds.ceiling; value++) {
      expect(valueAt(bounds, fractionOf(bounds, value)), value);
    }
  });

  test('a position between two stops reads as the nearest whole value', () {
    // 4 sits at 3/9 of the track, 5 at 4/9.
    expect(valueAt(bounds, 3.4 / 9), 4);
    expect(valueAt(bounds, 3.6 / 9), 5);
  });
}
