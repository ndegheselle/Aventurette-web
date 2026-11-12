import 'package:ajil/ui/theme/app_theme.dart';
import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:mix/mix.dart';

class DockItem {
  const DockItem({required this.icon, required this.label});

  final IconData icon;
  final String label;
}

/// The bottom navigation: one entry per tab, the current one in a pill.
class AppDock extends StatelessWidget {
  const AppDock({super.key, required this.items, required this.currentIndex, required this.onSelected});

  final List<DockItem> items;
  final int currentIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Box(
      style: BoxStyler()
          .color(AppColors.display.base0())
          .border(BoxBorderMix.top(BorderSideMix(color: AppColors.display.border0(), width: AppSizes.thickness())))
          .padding(EdgeInsetsGeometryMix.symmetric(horizontal: 6, vertical: 6)),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            for (final (index, item) in items.indexed)
              Expanded(
                child: _DockEntry(item: item, selected: index == currentIndex, onTap: () => onSelected(index)),
              ),
          ],
        ),
      ),
    );
  }
}

class _DockEntry extends StatelessWidget {
  const _DockEntry({required this.item, required this.selected, required this.onTap});

  final DockItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? context.token(AppColors.primary.foreground) : context.token(AppColors.foreground);

    return Semantics(
      button: true,
      selected: selected,
      label: item.label,
      excludeSemantics: true,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Box(
          style: BoxStyler()
              .padding(EdgeInsetsGeometryMix.symmetric(vertical: 6))
              .borderRadius(BorderRadiusGeometryMix.all(AppRadii.display()))
              .color(selected ? AppColors.primary.fill() : const Color(0x00000000)),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            spacing: 2,
            children: [
              Icon(item.icon, size: 20, color: color),
              Text(
                item.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: context.token(AppSizes.fontXs), color: color, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
