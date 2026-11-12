/// Backend error codes keyed by field name. The UI turns each code into a message.
typedef FieldErrors = Map<String, String>;

/// A rejected write. The adapter maps its own transport errors into this; anything else (a
/// missing record, a forbidden call, a network failure) is rethrown as it was.
class ValidationError implements Exception {
  const ValidationError([this.fields = const {}, this.message = 'Validation failed']);

  final FieldErrors fields;
  final String message;

  @override
  String toString() => 'ValidationError($message, $fields)';
}

/// Asked for the signed-in user with nobody signed in: a bug, since the router keeps every
/// private screen behind the session.
class NotAuthenticatedError extends StateError {
  NotAuthenticatedError() : super('Nobody is signed in.');
}
