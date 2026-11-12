import 'package:flutter/widgets.dart';
import 'package:go_router/go_router.dart';

/// A full-screen view: slides in from the right, over the dock. go_router's default page is
/// Material's, so every route says which of these it is.
Page<void> fullScreenPage(GoRouterState state, Widget child) => CustomTransitionPage<void>(
  key: state.pageKey,
  child: child,
  transitionsBuilder: (context, animation, secondaryAnimation, child) => SlideTransition(
    position: Tween(
      begin: const Offset(1, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
    child: child,
  ),
);

/// A dock tab's page, or a view inside one: swapped in place, with no transition.
Page<void> tabPage(GoRouterState state, Widget child) => NoTransitionPage<void>(key: state.pageKey, child: child);

/// A full-screen route whose page is [builder].
GoRoute fullScreenRoute(String path, Widget Function(BuildContext context, GoRouterState state) builder) =>
    GoRoute(path: path, pageBuilder: (context, state) => fullScreenPage(state, builder(context, state)));
