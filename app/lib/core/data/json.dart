import 'package:aventurette/core/data/entity.dart';

/// PocketBase stores an empty value as its zero: these read a missing or empty one the same way.
String asString(Object? value) => value is String ? value : '';

int asInt(Object? value) => value is num ? value.toInt() : 0;

bool asBool(Object? value) => value is bool && value;

List<String> asStrings(Object? value) => value is List ? value.whereType<String>().toList() : const [];

JsonMap asMap(Object? value) => value is Map ? value.cast<String, dynamic>() : const {};
