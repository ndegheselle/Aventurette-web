class NotImplementedError implements Exception {}

class NotAuthenticatedError implements Exception {}

/// Backend error code keyed by field name. The UI turns each code into a message.
typedef FieldErrors = Map<String, String>;

/// A rejected write. Adapters map their own transport errors into this.
class ValidationError implements Exception {
  ValidationError([this.fields = const {}, this.message = 'Validation failed']);

  final FieldErrors fields;
  final String message;

  @override
  String toString() => 'ValidationError: $message $fields';
}
