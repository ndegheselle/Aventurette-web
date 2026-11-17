import 'package:ajil/app/app.dart';
import 'package:ajil/backend/backend.dart';
import 'package:ajil/core/data/mapper.dart';
import 'package:ajil/features/user/api/preferences_api.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:forui/forui.dart';
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

  testWidgets("a sheet opens its preparation, whose material can be ticked, and goes back to it", (tester) async {
    await pumpApp(
      tester,
      user: sessionRecord(),
      seeds: {
        'users': [
          {'id': 'u1', 'favorites': <String>[]},
        ],
        'activities': [
          {
            'id': 'a1',
            'name': 'La quête du remède',
            'state': 'PUBLISHED',
            'expand': {
              'materials': [
                {
                  'id': 'm1',
                  'quantity': 'Un par équipe',
                  'expand': {
                    'material': {'id': 'c1', 'name': 'Foulards'},
                  },
                },
              ],
            },
          },
        ],
      },
    );

    await tester.tap(find.text('La quête du remède'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Préparation et matériel'));
    await tester.pumpAndSettle();

    expect(find.text('Préparation'), findsOneWidget);
    expect(find.text('Un par équipe'), findsOneWidget);

    await tester.tap(find.text('Foulards'));
    await tester.pumpAndSettle();
    expect(tester.widget<FCheckbox>(find.byType(FCheckbox)).value, isTrue);

    await tester.tap(find.text('Retour à la fiche'));
    await tester.pumpAndSettle();
    expect(find.text('Préparation et matériel'), findsOneWidget, reason: 'back on the sheet');
  });

  testWidgets("the Planning tab shows the week's events by day, and another range on demand", (tester) async {
    final today = DateTime.now();
    await pumpApp(
      tester,
      user: sessionRecord(),
      seeds: {
        'users': [
          {'id': 'u1', 'favorites': <String>[]},
        ],
        'events': [
          {
            'id': 'e1',
            'owner': 'u1',
            'name': 'Sortie SG',
            'start': DateTime(today.year, today.month, today.day, 9, 30).toUtc().toIso8601String(),
            'end': DateTime(today.year, today.month, today.day, 17, 30).toUtc().toIso8601String(),
            'status': 'PREPARING',
          },
        ],
      },
    );

    await tester.tap(find.text('Planning').last);
    await tester.pumpAndSettle();

    expect(find.text('Sortie SG'), findsOneWidget);
    expect(find.text('9h30–17h30 · Préparation en cours'), findsOneWidget);
    expect(find.text('Commencer un planning'), findsOneWidget);

    await tester.tap(find.bySemanticsLabel('Afficher par'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Année'));
    await tester.pumpAndSettle();
    expect(find.text('${today.year}'), findsOneWidget, reason: 'the period shown is the year');
    expect(find.text('Sortie SG'), findsOneWidget);
  });

  testWidgets('planning picks activities in the catalogue, then lays them out from the start time', (tester) async {
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

    await tester.tap(find.text('Planning').last);
    await tester.pumpAndSettle();
    await tester.tap(find.text('Commencer un planning'));
    await tester.pumpAndSettle();
    expect(find.text('Planification en cours · aucune activité'), findsOneWidget, reason: 'the catalogue, in planning mode');

    await tester.tap(find.text('La quête du remède'));
    await tester.pumpAndSettle();
    await tester.tap(find.byIcon(FLucideIcons.calendarPlus));
    await tester.pumpAndSettle();
    expect(find.text('Planification en cours · 1 activité'), findsOneWidget);
    expect(find.byIcon(FLucideIcons.calendarMinus), findsOneWidget, reason: 'it is in the plan now: the button takes it out');
    await tester.tap(find.text('À planifier'));
    await tester.pumpAndSettle();

    expect(find.text('Heure de début'), findsOneWidget, reason: 'asked the first time');
    await tester.tap(find.text('Valider'));
    await tester.pumpAndSettle();

    expect(find.text('Planning de la journée'), findsOneWidget);
    expect(find.text('9h–9h30'), findsOneWidget, reason: 'an activity with no length takes half an hour');
    expect(find.text('Enregistrer le planning'), findsOneWidget);

    await tester.tap(find.text('9h–9h30'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Retirer'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Aucune activité choisie'), findsOneWidget);
    expect(find.text('Enregistrer le planning'), findsNothing, reason: 'nothing to save');
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
