import 'package:aventurette/app/i18n.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  final catalogue = <String, Messages>{
    'fr': {
      'a': {'only': 'seulement', 'both': 'les deux fr'},
      'hello': 'Bonjour {name}',
    },
    'en': {
      'a': {'both': 'both en'},
      'hello': 'Hello {name}',
    },
  };

  group('translate', () {
    test('reads the locale asked for', () {
      expect(translate(catalogue, 'en', 'a.both', {}), 'both en');
    });

    test('falls back to the default locale for a key the locale lacks', () {
      expect(translate(catalogue, 'en', 'a.only', {}), 'seulement');
    });

    test('shows the key itself when no locale has it', () {
      expect(translate(catalogue, 'en', 'a.missing', {}), 'a.missing');
      expect(translate(catalogue, 'en', 'a', {}), 'a');
    });

    test('fills placeholders, and leaves one with no value as written', () {
      expect(translate(catalogue, 'en', 'hello', {'name': 'Ada'}), 'Hello Ada');
      expect(translate(catalogue, 'en', 'hello', {}), 'Hello {name}');
    });
  });

  group('mergeMessages', () {
    test('keeps both subtrees when two files share a top-level key', () {
      final target = <String, dynamic>{
        'activities': {'title': 'Activités'},
      };

      mergeMessages(target, {
        'activities': {'steps': 'Étapes'},
      });

      expect(target, {
        'activities': {'title': 'Activités', 'steps': 'Étapes'},
      });
    });
  });

  group('I18n', () {
    test('starts in a locale it has, else the default', () {
      expect(I18n(catalogue, locale: 'en').locale, 'en');
      expect(I18n(catalogue, locale: 'de').locale, defaultLocale);
      expect(I18n(catalogue).locale, defaultLocale);
    });
  });
}
