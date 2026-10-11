import 'package:aventurette/backend/pocketbase/errors.dart';
import 'package:aventurette/core/core.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:pocketbase/pocketbase.dart';

ClientException refusal(int status, [Map<String, dynamic> response = const {}]) {
  return ClientException(statusCode: status, response: response);
}

void main() {
  group('toValidationError', () {
    test('turns a refused write into per-field codes', () {
      final error = toValidationError(
        refusal(400, {
          'message': 'Failed to create record.',
          'data': {
            'email': {'code': 'validation_invalid_email', 'message': 'Invalid'},
            'password': {'code': 'validation_required'},
          },
        }),
      );

      expect(error, isA<ValidationError>());
      expect(error!.fields, {'email': 'validation_invalid_email', 'password': 'validation_required'});
    });

    test('keeps a refusal with no field detail', () {
      expect(toValidationError(refusal(400))!.fields, isEmpty);
    });

    test('leaves any other failure alone', () {
      expect(toValidationError(refusal(404)), isNull);
      expect(toValidationError(refusal(403)), isNull);
      expect(toValidationError(refusal(500)), isNull);
      // The SDK reports a network failure or an abort with status 0.
      expect(toValidationError(refusal(0)), isNull);
      expect(toValidationError(StateError('boom')), isNull);
    });
  });

  group('mapErrors', () {
    test('rethrows a refusal as a ValidationError, and anything else untouched', () async {
      await expectLater(mapErrors(() async => throw refusal(400)), throwsA(isA<ValidationError>()));
      await expectLater(mapErrors(() async => throw refusal(500)), throwsA(isA<ClientException>()));
    });
  });
}
