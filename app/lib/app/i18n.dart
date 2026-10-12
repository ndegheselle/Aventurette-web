import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

/// The boot default, and the fallback for a key missing from another locale.
const defaultLocale = 'fr';

typedef Messages = Map<String, dynamic>;

/// Recursive: two files sharing a top-level key must keep both subtrees.
void mergeMessages(Messages target, Messages source) {
  for (final entry in source.entries) {
    final existing = target[entry.key];
    final value = entry.value;
    if (existing is Map<String, dynamic> && value is Map<String, dynamic>) {
      mergeMessages(existing, value);
      continue;
    }
    target[entry.key] = value;
  }
}

String? _lookup(Messages messages, String key) {
  Object? node = messages;
  for (final part in key.split('.')) {
    if (node is! Map<String, dynamic>) return null;
    node = node[part];
  }
  return node is String ? node : null;
}

/// The message of `key` in `locale`, else in the default locale, else the key itself — so an
/// untranslated key shows its own path. `{name}` placeholders take their value from `params`.
String translate(Map<String, Messages> catalogue, String locale, String key, Map<String, Object?> params) {
  final template =
      _lookup(catalogue[locale] ?? const {}, key) ??
      _lookup(catalogue[defaultLocale] ?? const {}, key) ??
      key;

  return template.replaceAllMapped(RegExp(r'\{(\w+)\}'), (match) {
    final value = params[match.group(1)];
    return value == null ? match.group(0)! : '$value';
  });
}

/// The whole catalogue: every `locales/<locale>.json` the app ships, the design system's, the
/// app's and each feature's. Nothing to register — a new file in a `locales/` folder is picked up.
class I18n extends ChangeNotifier {
  I18n(this.catalogue, {String? locale}) : _locale = _supported(catalogue, locale);

  final Map<String, Messages> catalogue;
  String _locale;

  String get locale => _locale;

  static Future<I18n> load() async {
    final manifest = await AssetManifest.loadFromAssetBundle(rootBundle);
    final catalogue = <String, Messages>{};

    for (final path in manifest.listAssets()) {
      final match = RegExp(r'/locales/([\w-]+)\.json$').firstMatch(path);
      if (match == null) continue;

      final messages = jsonDecode(await rootBundle.loadString(path)) as Messages;
      mergeMessages(catalogue.putIfAbsent(match.group(1)!, () => {}), messages);
    }

    return I18n(catalogue, locale: PlatformDispatcher.instance.locale.languageCode);
  }

  /// A stored or device locale can name a translation the app does not have.
  static String _supported(Map<String, Messages> catalogue, String? locale) {
    return catalogue.containsKey(locale) ? locale! : defaultLocale;
  }

  set locale(String value) {
    _locale = _supported(catalogue, value);
    notifyListeners();
  }

  String t(String key, [Map<String, Object?> params = const {}]) {
    return translate(catalogue, _locale, key, params);
  }
}

/// Makes the catalogue reachable from a build method: `context.t('back')`.
class I18nScope extends InheritedNotifier<I18n> {
  const I18nScope({super.key, required I18n i18n, required super.child}) : super(notifier: i18n);

  static I18n of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<I18nScope>()!.notifier!;
  }
}

extension I18nContext on BuildContext {
  String t(String key, [Map<String, Object?> params = const {}]) {
    return I18nScope.of(this).t(key, params);
  }
}
