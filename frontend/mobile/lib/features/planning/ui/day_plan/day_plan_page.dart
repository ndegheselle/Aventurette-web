import 'dart:math';

import 'package:ajil/features/activities/routes.dart';
import 'package:ajil/features/planning/models/day_plan.dart';
import 'package:ajil/features/planning/routes.dart';
import 'package:ajil/features/planning/state/day_plan.dart';
import 'package:ajil/features/planning/state/planning.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/features/planning/ui/day_plan/planned_activity_card.dart';
import 'package:ajil/features/planning/ui/day_plan/save_plan_sheet.dart';
import 'package:ajil/features/planning/ui/planning_text.dart';
import 'package:ajil/ui/content/surfaces.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/sheet.dart';
import 'package:ajil/ui/overlays/toast.dart';
import 'package:ajil/ui/shell/page.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:forui/forui.dart';
import 'package:go_router/go_router.dart';

/// How tall a minute is on the timeline: an hour is 90 pixels.
const _pixelsPerMinute = 1.5;

/// Room above midnight, so its label is not cut.
const _top = 8.0;
const _hourColumn = 44.0;

/// A move by hand lands on a multiple of this many minutes.
const _snapMinutes = 5;

double _offsetOf(int minutes) => _top + minutes * _pixelsPerMinute;

/// The plan of the day: the activities picked, as cards on a timeline of the day's hours. The
/// first time it opens with activities, it asks when the day starts and lays them out from there.
class DayPlanPage extends ConsumerStatefulWidget {
  const DayPlanPage({super.key});

  @override
  ConsumerState<DayPlanPage> createState() => _DayPlanPageState();
}

class _DayPlanPageState extends ConsumerState<DayPlanPage> {
  late final ScrollController _scroll;

  @override
  void initState() {
    super.initState();
    final plan = ref.read(dayPlanProvider);
    final activities = plan?.activities ?? const <PlannedActivity>[];
    final first = plan != null && plan.scheduled && activities.isNotEmpty
        ? activities.map((activity) => activity.start).reduce(min)
        : defaultStartMinutes;
    _scroll = ScrollController(initialScrollOffset: _scrollOffsetOf(first));

    if (plan != null && !plan.scheduled && activities.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _askStart());
    }
  }

  @override
  void dispose() {
    _scroll.dispose();
    super.dispose();
  }

  /// Half an hour above [minutes], so the card has some of the day before it.
  double _scrollOffsetOf(int minutes) => max(0, _offsetOf(minutes - 30));

  Future<void> _askStart() async {
    // Closed without confirming: the day starts at the default time.
    final start = await _askStartTime(context) ?? defaultStartMinutes;
    ref.read(dayPlanProvider.notifier).schedule(start);
    if (!_scroll.hasClients) return;
    _scroll.jumpTo(min(_scrollOffsetOf(start), _scroll.position.maxScrollExtent));
  }

  void _back() {
    if (context.canPop()) {
      context.pop();
    } else {
      context.go(ActivitiesRoutes.catalogue);
    }
  }

  /// Asks the day, saves the plan on it, and shows that day on the planning.
  Future<void> _save() async {
    final t = context.t.planning.plan;
    final day = await askPlanDay(context, initial: ref.read(planningProvider).day);
    if (day == null || !mounted) return;

    final saved = await runAction(context, () async {
      await ref.read(dayPlanProvider.notifier).save(day);
      return true;
    }, failure: t.saveFailed);
    if (saved != true || !mounted) return;

    showAppToast(context, title: t.saved, icon: FLucideIcons.calendarCheck);
    context.go(PlanningRoutes.tab);
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t.planning.plan;
    final activities = ref.watch(dayPlanProvider)?.activities ?? const [];

    return AppPage(
      header: BackHeader(title: t.title, onBack: _back),
      body: activities.isEmpty
          ? EmptyState(icon: FLucideIcons.calendarPlus, message: t.empty)
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(AppSpaces.page, AppSpaces.spacing, AppSpaces.page, 0),
                  child: HintBox(t.hint),
                ),
                Expanded(
                  child: _Timeline(controller: _scroll, activities: activities),
                ),
              ],
            ),
      actions: BottomActionBar(
        children: [
          Row(
            spacing: AppSpaces.spacing,
            children: [
              Expanded(
                child: FButton(
                  variant: .outline,
                  prefix: const Icon(FLucideIcons.plus),
                  // The plan stays open: what is picked there is added after the last activity.
                  onPress: () => context.go(ActivitiesRoutes.catalogue),
                  child: Text(t.add),
                ),
              ),
              if (activities.isNotEmpty)
                Expanded(
                  flex: 2,
                  child: FButton(prefix: const Icon(FLucideIcons.save), onPress: _save, child: Text(t.save)),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

/// The day's 24 hours down the left, and the activities beside them, at their time.
class _Timeline extends StatelessWidget {
  const _Timeline({required this.controller, required this.activities});

  final ScrollController controller;
  final List<PlannedActivity> activities;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final border = context.theme.colors.border;
    const hours = minutesPerDay ~/ 60;

    final scroll = SingleChildScrollView(
      controller: controller,
      padding: const EdgeInsets.symmetric(horizontal: AppSpaces.page, vertical: AppSpaces.spacing),
      child: SizedBox(
        height: _offsetOf(minutesPerDay) + _top,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              width: _hourColumn,
              child: Stack(
                children: [
                  for (var hour = 0; hour <= hours; hour++)
                    Positioned(
                      top: _offsetOf(hour * 60) - 7,
                      left: 0,
                      child: Text(clockText(t, hour * 60), style: context.captionText),
                    ),
                ],
              ),
            ),
            Expanded(
              child: LayoutBuilder(
                builder: (context, constraints) => Stack(
                  children: [
                    for (var hour = 0; hour <= hours; hour++)
                      Positioned(
                        top: _offsetOf(hour * 60),
                        left: 0,
                        right: 0,
                        child: Container(height: 1, color: border),
                      ),
                    for (final slot in timelineOf(activities))
                      Positioned(
                        // Keyed so a card keeps its drag while the others move.
                        key: ValueKey(slot.activity.key),
                        top: _offsetOf(slot.activity.start),
                        left: constraints.maxWidth / slot.lanes * slot.lane,
                        width: constraints.maxWidth / slot.lanes - 2,
                        height: max(slot.activity.minutes, defaultActivityMinutes) * _pixelsPerMinute - 2,
                        child: _TimelineCard(activity: slot.activity),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );

    return LayoutBuilder(
      builder: (context, constraints) => Stack(
        children: [
          scroll,
          Positioned.fill(
            child: ListenableBuilder(
              listenable: controller,
              builder: (context, _) => _OutOfViewBadges(
                activities: activities,
                offset: controller.hasClients ? controller.offset : controller.initialScrollOffset,
                height: constraints.maxHeight,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Over the timeline, how many activities are scrolled out of view: at its top for those above,
/// at its bottom for those below.
class _OutOfViewBadges extends StatelessWidget {
  const _OutOfViewBadges({required this.activities, required this.offset, required this.height});

  final List<PlannedActivity> activities;

  /// How far the timeline is scrolled, and how tall its view is, in pixels.
  final double offset;
  final double height;

  double _minuteAt(double pixels) => (pixels - AppSpaces.spacing - _top) / _pixelsPerMinute;

  @override
  Widget build(BuildContext context) {
    final count = context.t.planning.mode.count;
    final outside = outOfView(activities, _minuteAt(offset), _minuteAt(offset + height));

    Widget badge(int n, IconData icon) => FBadge(
      variant: .secondary,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        spacing: 4,
        children: [
          Icon(icon, size: 14),
          Text(count(n: n)),
        ],
      ),
    );

    return IgnorePointer(
      child: Padding(
        padding: const EdgeInsets.all(AppSpaces.spacing),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            if (outside.above > 0) badge(outside.above, FLucideIcons.arrowUp) else const SizedBox.shrink(),
            if (outside.below > 0) badge(outside.below, FLucideIcons.arrowDown) else const SizedBox.shrink(),
          ],
        ),
      ),
    );
  }
}

/// A planned activity: its name and time. A tap opens its sheet; held, it follows the finger
/// up or down and lands on the nearest five minutes.
class _TimelineCard extends ConsumerStatefulWidget {
  const _TimelineCard({required this.activity});

  final PlannedActivity activity;

  @override
  ConsumerState<_TimelineCard> createState() => _TimelineCardState();
}

class _TimelineCardState extends ConsumerState<_TimelineCard> {
  double _drag = 0;
  bool _dragging = false;

  int get _draggedStart {
    final moved = (_drag / _pixelsPerMinute / _snapMinutes).round() * _snapMinutes;
    return clampStart(widget.activity.start + moved, widget.activity.minutes);
  }

  void _drop() {
    ref.read(dayPlanProvider.notifier).moveTo(widget.activity.key, _draggedStart);
    setState(() {
      _drag = 0;
      _dragging = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    final shown = _dragging ? widget.activity.copyWith(start: _draggedStart) : widget.activity;

    return Transform.translate(
      offset: Offset(0, _drag),
      child: GestureDetector(
        onLongPressStart: (_) => setState(() => _dragging = true),
        onLongPressMoveUpdate: (details) => setState(() => _drag = details.offsetFromOrigin.dy),
        onLongPressEnd: (_) => _drop(),
        child: PlannedActivityCard(
          name: shown.name,
          time: slotText(context.t, shown),
          highlighted: _dragging,
          onTap: () => _showActivitySheet(context, ref, widget.activity),
        ),
      ),
    );
  }
}

/// Asks when the day starts; resolves to minutes since midnight, or null when closed.
Future<int?> _askStartTime(BuildContext context) {
  final t = context.t.planning.plan;
  var chosen = const FTime(defaultStartMinutes ~/ 60, defaultStartMinutes % 60);

  return showAppSheet<int>(
    context,
    title: t.startTitle,
    builder: (_) => Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: AppSpaces.spacing,
      children: [
        Text(t.startHint, style: context.captionText),
        SizedBox(
          height: 180,
          child: FTimePicker(
            hour24: true,
            minuteInterval: _snapMinutes,
            control: .managed(initial: chosen, onChange: (time) => chosen = time),
          ),
        ),
      ],
    ),
    actionsBuilder: (sheetContext) => FButton(
      onPress: () => Navigator.of(sheetContext).pop(chosen.hour * 60 + chosen.minute),
      child: Text(t.confirm),
    ),
  );
}

/// A planned activity's sheet: its time on a picker, applied as it turns; *Remplacer*, which
/// goes back to the catalogue to pick another; *Retirer*.
Future<void> _showActivitySheet(BuildContext context, WidgetRef ref, PlannedActivity activity) {
  final t = context.t.planning.plan;
  final notifier = ref.read(dayPlanProvider.notifier);

  return showAppSheet<void>(
    context,
    title: activity.name,
    builder: (_) => SizedBox(
      height: 180,
      child: FTimePicker(
        hour24: true,
        minuteInterval: _snapMinutes,
        control: .managed(
          initial: FTime(activity.start ~/ 60, activity.start % 60),
          onChange: (time) => notifier.moveTo(activity.key, time.hour * 60 + time.minute),
        ),
      ),
    ),
    actionsBuilder: (sheetContext) => Row(
      spacing: AppSpaces.spacing,
      children: [
        Expanded(
          child: FButton(
            variant: .outline,
            prefix: const Icon(FLucideIcons.replace),
            onPress: () {
              notifier.replace(activity.key);
              Navigator.of(sheetContext).pop();
              context.go(ActivitiesRoutes.catalogue);
            },
            child: Text(t.replace),
          ),
        ),
        Expanded(
          child: FButton(
            variant: .destructive,
            prefix: const Icon(FLucideIcons.trash2),
            onPress: () {
              notifier.remove(activity.key);
              Navigator.of(sheetContext).pop();
            },
            child: Text(t.remove),
          ),
        ),
      ],
    ),
  );
}
