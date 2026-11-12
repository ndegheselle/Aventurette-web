import 'package:ajil/core/errors.dart';
import 'package:pocketbase/pocketbase.dart';

/// The status PocketBase answers a refused write with: a field failed a rule, or a login failed.
const _badRequest = 400;

/// What PocketBase answers for an id it has no record under, or one the caller may not read.
const notFound = 404;

/// A PocketBase refusal as a [ValidationError]; null for any other failure — a missing record, a
/// forbidden call, a server error, a network failure or an abort — so those are rethrown as they
/// were.
ValidationError? toValidationError(Object error) {
  if (error is! ClientException || error.statusCode != _badRequest) return null;

  // PocketBase nests per-field errors under response.data: { field: { code, message } }.
  final data = (error.response['data'] as Map?) ?? const {};
  final fields = <String, String>{
    for (final MapEntry(:key, :value) in data.entries) key as String: ((value as Map?)?['code'] as String?) ?? '',
  };

  return ValidationError(fields, (error.response['message'] as String?) ?? 'Validation failed');
}

/// Run a PocketBase call, normalising a refusal on the way out.
Future<T> mapErrors<T>(Future<T> Function() call) async {
  try {
    return await call();
  } on ClientException catch (error) {
    throw toValidationError(error) ?? error;
  }
}
