import 'package:ajil/features/planning/events/routes.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// *+ Créer un événement*, which ends each of the Planning tab's views.
class CreateEventButton extends StatelessWidget {
  const CreateEventButton({super.key});

  @override
  Widget build(BuildContext context) =>
      FButton(onPress: () => context.push(EventsRoutes.create), child: Text(context.t.events.create));
}
