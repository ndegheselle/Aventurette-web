import 'package:aventurette/core/core.dart';
import 'package:pocketbase/pocketbase.dart';

/// Resolves stored file names to urls.
class PocketBaseFileUrls implements FileUrlResolver {
  PocketBaseFileUrls(this._client);

  final PocketBase _client;

  @override
  String getUrl(JsonMap record, String filename) {
    final model = RecordModel(record);
    return _client.files.getURL(model, filename).toString();
  }
}
