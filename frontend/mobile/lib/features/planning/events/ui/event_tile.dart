import 'package:ajil/features/planning/events/models/event.dart';
import 'package:ajil/features/planning/events/routes.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// An event in a tile group: its name, [subtitle] under it, and a tap opening it.
FTile eventTile(BuildContext context, PlanningEvent event, {required String subtitle}) => FTile(
  title: Text(event.name),
  subtitle: Text(subtitle),
  suffix: const Icon(FLucideIcons.chevronRight),
  onPress: () => context.push(EventsRoutes.event(event.id)),
);
