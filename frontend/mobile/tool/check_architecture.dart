// The architecture's boundaries, checked rather than trusted: `dart run tool/check_architecture.dart`
// lists every import that crosses one, and fails if any does. The mobile counterpart of
// `backend/scripts/lint-arch.mjs`; the rules are in docs/architecture.md.

import 'dart:io';

const _layers = {'models', 'api', 'state', 'ui'};

final _import = RegExp(r'''^\s*(?:import|export)\s+['"]([^'"]+)['"]''', multiLine: true);

/// Where a file sits: its top folder under `lib/`, and for a feature, its folder and its layer.
class _Place {
  _Place(this.path) {
    final parts = path.split('/');
    top = parts.length > 1 ? parts[1] : '';
    if (top != 'features') return;

    final layerIndex = parts.indexWhere(_layers.contains);
    if (layerIndex == -1) {
      feature = parts.sublist(2, parts.length - 1).join('/');
      return;
    }
    feature = parts.sublist(2, layerIndex).join('/');
    layer = parts[layerIndex];
  }

  final String path;
  late final String top;
  String? feature;
  String? layer;
}

/// A rule: what it forbids, and the message saying why.
typedef _Rule = String? Function(_Place file, String import);

String? _target(String import) => import.startsWith('package:ajil/') ? 'lib/${import.substring(13)}' : null;

final _rules = <_Rule>[
  (file, import) => import.startsWith('package:pocketbase/') && !file.path.startsWith('lib/backend/pocketbase/')
      ? 'the PocketBase SDK is imported only by lib/backend/pocketbase/'
      : null,
  (file, import) {
    final target = _target(import);
    if (target == null || !target.startsWith('lib/backend/')) return null;
    final allowed = file.layer == 'api' || file.top == 'app' || file.top == 'backend' || file.path == 'lib/main.dart';
    return allowed ? null : 'lib/backend/ is reached only through a feature\'s api/';
  },
  (file, import) {
    final layer = file.layer;
    if (layer != 'models' && layer != 'api') return null;
    if (import.startsWith('package:flutter/') || import.startsWith('package:flutter_riverpod/')) {
      return '$layer/ is plain Dart: no Flutter';
    }
    if (layer == 'models' && import.startsWith('package:riverpod/')) return 'models/ holds no state';
    return null;
  },
  (file, import) {
    if (file.layer != 'models') return null;
    final target = _target(import);
    if (target == null) return null;
    final allowed = target.startsWith('lib/core/') || _Place(target).layer == 'models';
    return allowed ? null : 'models/ imports only core/ and other models/';
  },
  (file, import) {
    final target = _target(import);
    if (file.layer != 'ui' || target == null) return null;
    return _Place(target).layer == 'api' ? 'ui/ reaches the backend through state/, never api/' : null;
  },
  (file, import) {
    final target = _target(import);
    if (file.top != 'core' || target == null) return null;
    return target.startsWith('lib/core/') ? null : 'core/ imports nothing of ours';
  },
  (file, import) {
    if (file.top != 'core') return null;
    final external = import.startsWith('package:') && !import.startsWith('package:ajil/');
    return external ? 'core/ imports no package' : null;
  },
  (file, import) {
    final target = _target(import);
    if (file.top != 'features' || target == null) return null;
    return target.startsWith('lib/app/') ? 'a feature never imports the app: the app composes features' : null;
  },
  (file, import) {
    final target = _target(import);
    if (file.top != 'ui' || target == null) return null;
    final forbidden = ['lib/features/', 'lib/app/', 'lib/backend/'].any(target.startsWith);
    return forbidden ? 'ui/ is shared: it knows no feature, no app and no backend' : null;
  },
  (file, import) => import.startsWith('package:') || import.startsWith('dart:')
      ? null
      : 'imports are non-relative: package:ajil/…',
];

/// The one file that calls forui's toasts: every other one goes through `showAppToast`.
const _toast = 'lib/ui/overlays/toast.dart';
final _rawToast = RegExp(r'\bshow(?:Raw)?FToast\s*[<(]');

void main() {
  final violations = <String>[];

  final files = Directory('lib')
      .listSync(recursive: true)
      .whereType<File>()
      .where((file) => file.path.endsWith('.dart') && !file.path.endsWith('.g.dart'));

  for (final file in files) {
    final place = _Place(file.path.replaceAll(r'\', '/'));
    final source = file.readAsStringSync();
    if (place.path != _toast && _rawToast.hasMatch(source)) {
      violations.add('${place.path}: showFToast — a toast goes through showAppToast ($_toast), so all look alike');
    }
    for (final match in _import.allMatches(source)) {
      final import = match[1]!;
      for (final rule in _rules) {
        final message = rule(place, import);
        if (message != null) violations.add('${place.path}: $import — $message');
      }
    }
  }

  if (violations.isEmpty) {
    stdout.writeln('Architecture: no boundary crossed.');
    return;
  }

  violations.forEach(stderr.writeln);
  stderr.writeln('\n${violations.length} boundary crossing(s).');
  exitCode = 1;
}
