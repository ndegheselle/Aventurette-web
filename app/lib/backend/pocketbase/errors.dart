import 'package:aventurette/core/core.dart';
import 'package:pocketbase/pocketbase.dart';

/// The status PocketBase answers a refused write with: a field failed a rule, or a login failed.
const badRequest = 400;

/// What PocketBase answers for an id it has no record under, or one the caller may not read.
const notFound = 404;

/// A refusal as a ValidationError. Null for any other failure — a missing record, a forbidden
/// call, a server error, a network failure — so those are rethrown untouched.
ValidationError? toValidationError(Object error) {
  if (error is! ClientException || error.statusCode != badRequest) return null;

  // PocketBase nests per-field errors under response.data.
  final data = error.response['data'];
  final fields = <String, String>{};
  if (data is Map) {
    for (final entry in data.entries) {
      final code = entry.value is Map ? (entry.value as Map)['code'] : null;
      if (code is String) fields[entry.key as String] = code;
    }
  }
  return ValidationError(fields, error.response['message']?.toString() ?? 'Validation failed');
}

/// Run a PocketBase call, normalising a refusal on the way out.
Future<T> mapErrors<T>(Future<T> Function() call) async {
  try {
    return await call();
  } catch (error) {
    final validation = toValidationError(error);
    if (validation != null) throw validation;
    rethrow;
  }
}
