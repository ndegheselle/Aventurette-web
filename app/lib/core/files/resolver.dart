import 'package:aventurette/core/data/entity.dart';

/// Resolves a stored file name to a url. Handed to the mappers so a model stays free of the backend.
abstract interface class FileUrlResolver {
  String getUrl(JsonMap record, String filename);
}
