// Checks the boundaries ARCHITECTURE.md describes: `dart run tool/lint_arch.dart`.
import 'dart:io';

/// One import found in a file of `lib/`.
class Import {
  Import(this.file, this.uri);

  final String file;
  final String uri;
}

/// A rule: files under [scope] may not import anything matching [forbidden], except [allowed].
class Rule {
  Rule(this.name, {required this.scope, required this.forbidden, this.allowed});

  final String name;
  final RegExp scope;
  final RegExp forbidden;
  final RegExp? allowed;

  bool breaks(Import import) {
    if (!scope.hasMatch(import.file)) return false;
    if (!forbidden.hasMatch(import.uri)) return false;
    return !(allowed?.hasMatch(import.file) ?? false);
  }
}

const flutterUi = r'package:flutter/(material|widgets|cupertino)\.dart';

// A feature may sit in a group folder: features/admin/<name>/.
const feature = r'lib/features/(?:[\w-]+/)?[\w-]+';

final rules = [
  Rule(
    'model/ is framework-free and backend-free',
    scope: RegExp('$feature/model/'),
    forbidden: RegExp(
      r'package:(flutter|pocketbase)|aventurette/backend/|/(api|composables|components|pages)/',
    ),
  ),
  Rule(
    'api/ is framework-free and does not reach up',
    scope: RegExp('$feature/api/'),
    forbidden: RegExp(r'package:(flutter|pocketbase)|/(composables|components|pages)/'),
  ),
  Rule(
    'composables/ hold state, not widgets',
    scope: RegExp('$feature/composables/'),
    forbidden: RegExp('$flutterUi|/(components|pages)/'),
  ),
  Rule(
    'components/ do not reach up to pages',
    scope: RegExp('$feature/components/'),
    forbidden: RegExp('/pages/'),
  ),
  Rule(
    'only api/ talks to the backend',
    scope: RegExp(r'lib/(features|ui|app)/'),
    forbidden: RegExp(r'aventurette/backend/'),
    allowed: RegExp('$feature/api/|lib/ui/.*_test.dart|_test.dart'),
  ),
  Rule(
    'only backend/ imports package:pocketbase',
    scope: RegExp(r'lib/(?!backend/)'),
    forbidden: RegExp(r'package:pocketbase/'),
  ),
  Rule(
    'core/ knows nothing of ours',
    scope: RegExp(r'lib/core/'),
    forbidden: RegExp(r'package:(flutter|pocketbase)|aventurette/(?!core/)'),
  ),
  Rule(
    'ui/ never learns which backend or feature exists',
    scope: RegExp(r'lib/ui/'),
    forbidden: RegExp(r'aventurette/(backend|features)/'),
  ),
  Rule(
    'the test toolkit cannot reach the app',
    scope: RegExp(r'lib/(?!testing/)(?!.*_test\.dart)'),
    forbidden: RegExp(r'aventurette/testing/'),
  ),
  Rule('imports are not relative', scope: RegExp(r'lib/'), forbidden: RegExp(r'^\.{1,2}/')),
];

/// Specs live in a feature's `tests/` folder, and nowhere else under `features/`.
bool misplacedSpec(String file) {
  final inFeature = RegExp('$feature/').hasMatch(file);
  return inFeature && file.endsWith('_test.dart') && !file.contains('/tests/');
}

List<Import> importsOf(File file) {
  final pattern = RegExp(r'''^\s*(?:import|export)\s+['"]([^'"]+)['"]''', multiLine: true);
  final source = file.readAsStringSync();
  return [for (final match in pattern.allMatches(source)) Import(file.path, match.group(1)!)];
}

void main() {
  final files = Directory('lib')
      .listSync(recursive: true)
      .whereType<File>()
      .where((file) => file.path.endsWith('.dart'))
      .toList();

  final problems = <String>[];

  for (final file in files) {
    if (misplacedSpec(file.path)) {
      problems.add('${file.path}: a spec belongs in its feature\'s tests/ folder');
    }

    for (final import in importsOf(file)) {
      for (final rule in rules) {
        if (rule.breaks(import)) problems.add('${import.file}: ${rule.name} (imports ${import.uri})');
      }
    }
  }

  if (problems.isEmpty) {
    stdout.writeln('lint:arch ok — ${files.length} files');
    return;
  }

  problems.forEach(stderr.writeln);
  exit(1);
}
