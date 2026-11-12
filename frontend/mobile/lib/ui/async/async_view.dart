import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/theme/styles.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:remix/remix.dart';

/// Renders an [AsyncValue]: a spinner while it loads, the data once it is there. A read the
/// backend cannot answer yet (`UnimplementedError`, see ADR 0023) shows *Bientôt disponible*
/// rather than an error.
class AsyncView<T> extends StatelessWidget {
  const AsyncView({super.key, required this.value, required this.data, this.onRetry});

  final AsyncValue<T> value;
  final Widget Function(T data) data;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return switch (value) {
      AsyncData(:final value) => data(value),
      AsyncError(:final error) when error is UnimplementedError => const ComingSoonView(),
      AsyncError() => ErrorView(onRetry: onRetry),
      _ => const LoadingView(),
    };
  }
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: RemixSpinner(style: spinnerStyle()),
    ),
  );
}

class ErrorView extends StatelessWidget {
  const ErrorView({super.key, this.onRetry});

  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 12,
          children: [
            const Icon(LucideIcons.cloudAlert, size: 40),
            StyledText(context.t.ui.errors.generic, style: bodyText()),
            if (onRetry != null)
              RemixButton(
                label: context.t.ui.actions.retry,
                style: buttonStyle(variant: ButtonVariant.outline),
                onPressed: onRetry,
              ),
          ],
        ),
      ),
    );
  }
}

/// What stands in for a screen, or a part of one, that is not built yet. [wireframe] is its id
/// in the Figma file, so whoever builds it knows where to look.
class ComingSoonView extends StatelessWidget {
  const ComingSoonView({super.key, this.wireframe});

  final String? wireframe;

  @override
  Widget build(BuildContext context) {
    final t = context.t.ui.comingSoon;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          spacing: 8,
          children: [
            const Icon(LucideIcons.hammer, size: 40),
            StyledText(t.title, style: headingText()),
            StyledText(t.body, style: captionText().textAlign(TextAlign.center)),
            if (wireframe != null) StyledText(t.wireframe(id: wireframe!), style: overlineText()),
          ],
        ),
      ),
    );
  }
}
