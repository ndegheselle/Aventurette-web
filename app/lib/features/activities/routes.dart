import 'package:aventurette/features/activities/pages/activities.page.dart';
import 'package:aventurette/features/activities/pages/activity.page.dart';
import 'package:aventurette/features/activities/pages/activity_play.page.dart';
import 'package:go_router/go_router.dart';

const routesNames = (page: 'activities.page', play: 'activities.play', all: 'activities');

final routes = <RouteBase>[
  GoRoute(path: '/activities', name: routesNames.all, builder: (_, _) => const ActivitiesPage()),
  GoRoute(
    path: '/activities/:id',
    name: routesNames.page,
    builder: (_, state) => ActivityPage(id: state.pathParameters['id']!),
  ),
  GoRoute(
    path: '/activities/:id/play',
    name: routesNames.play,
    builder: (_, state) => ActivityPlayPage(id: state.pathParameters['id']!),
  ),
];
