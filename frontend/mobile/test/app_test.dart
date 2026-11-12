import 'package:ajil/app/app.dart';
import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/user/api/preferences_api.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'support/container.dart';
import 'support/fake_crud.dart';

/// The app mounted whole on the fake ports, in French: the router, the shell, the theme and the
/// screens as a user would meet them.
Future<void> pumpApp(WidgetTester tester, {Payload? user, Map<String, List<Payload>> seeds = const {}}) async {
  SharedPreferences.setMockInitialValues({});
  final preferences = await SharedPreferences.getInstance();
  LocaleSettings.setLocale(AppLocale.fr);

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        crudFactoryProvider.overrideWithValue(FakeCrudFactory(seeds)),
        authProviderProvider.overrideWithValue(FakeAuth(user)),
        sharedPreferencesProvider.overrideWithValue(preferences),
      ],
      child: TranslationProvider(child: const AjilApp()),
    ),
  );
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('nobody signed in lands on the login', (tester) async {
    await pumpApp(tester);

    expect(find.text('Recevoir un code'), findsOneWidget);
    expect(find.text('Catalogue'), findsNothing);
  });

  testWidgets('a user who never saw the onboarding is shown it first', (tester) async {
    await pumpApp(
      tester,
      user: sessionRecord(onboarded: false),
      seeds: {
        'users': [
          {'id': 'u1'},
        ],
      },
    );

    expect(find.text('Bienvenue !'), findsOneWidget);
  });

  testWidgets('a signed-in user lands on the catalogue, with the dock, and opens an activity', (tester) async {
    await pumpApp(
      tester,
      user: sessionRecord(),
      seeds: {
        'users': [
          {'id': 'u1', 'favorites': <String>[]},
        ],
        'activities': [
          {'id': 'a1', 'name': 'La quête du remède', 'format': 'BIG_GAME', 'state': 'PUBLISHED'},
        ],
      },
    );

    expect(find.text('Pédagogie'), findsOneWidget, reason: 'the dock');
    expect(find.text('La quête du remède'), findsOneWidget);

    await tester.tap(find.text('La quête du remède'));
    await tester.pumpAndSettle();

    expect(find.text('Mode guidé'), findsOneWidget);
    expect(find.text('Pédagogie'), findsNothing, reason: 'a sheet is full screen, over the dock');
  });

  testWidgets('a dock tab that is not built yet says so', (tester) async {
    await pumpApp(
      tester,
      user: sessionRecord(),
      seeds: {
        'users': [
          {'id': 'u1', 'favorites': <String>[]},
        ],
      },
    );

    await tester.tap(find.text('Suivi'));
    await tester.pumpAndSettle();

    expect(find.text('Bientôt disponible'), findsOneWidget);
    expect(find.text('MAQUETTE C01'), findsOneWidget);
  });
}
