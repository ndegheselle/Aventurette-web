import 'package:ajil/features/activities/models/activity.dart';
import 'package:ajil/features/activities/state/catalogue.dart';
import 'package:ajil/features/activities/state/feedback.dart';
import 'package:ajil/features/activities/ui/favorite_button.dart';
import 'package:ajil/ui/async/async_view.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';

/// After a run: well done, and what the user thought of the activity. It replaced the run, so
/// *Quitter* goes back to the sheet. The wireframes' bilan (A08, A09) replaces it once
/// réalisations exist.
class FeedbackPage extends ConsumerWidget {
  const FeedbackPage({super.key, required this.activityId});

  final String activityId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final activity = ref.watch(activityProvider(activityId));
    final feedback = ref.watch(feedbackProvider(activityId));
    final loaded = activity.value;

    if (loaded == null || !feedback.hasValue) {
      return AppPage(
        header: const SizedBox(height: 48),
        body: AsyncView(value: activity, data: (_) => const LoadingView()),
      );
    }

    return _Feedback(activity: loaded, initialComment: feedback.value?.comment ?? '');
  }
}

class _Feedback extends ConsumerStatefulWidget {
  const _Feedback({required this.activity, required this.initialComment});

  final ActivityData activity;
  final String initialComment;

  @override
  ConsumerState<_Feedback> createState() => _FeedbackState();
}

class _FeedbackState extends ConsumerState<_Feedback> {
  late final _comment = TextEditingController(text: widget.initialComment);

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  FeedbackNotifier get _notifier => ref.read(feedbackProvider(widget.activity.id).notifier);

  /// Back to the sheet once the comment is saved: a refused one keeps the user here.
  Future<void> _leave() async {
    final t = context.t.activities.feedback;
    final saved = await runAction(context, () async {
      await _notifier.saveComment(_comment.text);
      return true;
    }, failure: t.saveRefused);
    if (saved == true && mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.activities.feedback;
    ref.watch(feedbackProvider(widget.activity.id));
    final liked = _notifier.liked;

    return AppPage(
      header: const SizedBox(height: 32),
      body: PageScroll(
        children: [
          const Icon(FLucideIcons.partyPopper, size: 72),
          Text(t.bravo, style: context.titleText, textAlign: TextAlign.center),
          Text(t.finished(name: widget.activity.name), style: context.captionText, textAlign: TextAlign.center),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            spacing: 12,
            children: [
              FButton.icon(
                variant: liked ? .primary : .outline,
                size: .lg,
                semanticsLabel: t.like,
                onPress: () => runAction(context, _notifier.toggleLike, failure: t.saveRefused),
                child: const Icon(FLucideIcons.thumbsUp),
              ),
              FavoriteButton(activity: widget.activity),
            ],
          ),
          FTextField.multiline(
            control: .managed(controller: _comment),
            label: Text(t.comment),
            hint: t.commentPlaceholder,
            maxLength: 2000,
            minLines: 4,
            maxLines: 8,
          ),
        ],
      ),
      actions: BottomActionBar(
        children: [
          FButton(size: .lg, onPress: _leave, child: Text(t.leave)),
        ],
      ),
    );
  }
}
