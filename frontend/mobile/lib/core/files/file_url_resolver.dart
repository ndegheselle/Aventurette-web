/// Resolves a stored file name to a url, given the record that holds it.
abstract interface class FileUrlResolver {
  String urlOf(Map<String, dynamic> record, String fileName);
}
