/// The Remix component styles, written once against the tokens. Remix ships no theme: a
/// component with no style renders bare, so every call site passes one of these.
///
/// Joufflu's interaction rules: an action changes background on press, an input changes border
/// on focus, selected and checked are the primary, disabled fades to `disabledOpacity`.
library;

import 'package:ajil/ui/theme/tokens.dart';
import 'package:flutter/widgets.dart';
import 'package:remix/remix.dart';

enum ButtonVariant {
  /// The one main action of a screen.
  primary,

  /// Any other action: filled with the page colour, bordered.
  outline,

  /// An action inside a list or a header, with no fill at rest.
  ghost,

  /// A destructive action.
  danger,
}

enum ControlSize { sm, md, lg }

double _heightOf(ControlSize size) => switch (size) {
  ControlSize.sm => AppSizes.heightSm(),
  ControlSize.md => AppSizes.heightMd(),
  ControlSize.lg => AppSizes.heightLg(),
};

double _paddingOf(ControlSize size) => switch (size) {
  ControlSize.sm => AppSpaces.actionPaddingSm(),
  ControlSize.md => AppSpaces.actionPaddingMd(),
  ControlSize.lg => AppSpaces.actionPaddingLg(),
};

BoxBorderMix _border(Color color) => BoxBorderMix.all(BorderSideMix(color: color, width: AppSizes.thickness()));

ButtonStyler buttonStyle({ButtonVariant variant = ButtonVariant.primary, ControlSize size = ControlSize.md}) {
  final base = ButtonStyler()
      .height(_heightOf(size))
      .padding(EdgeInsetsGeometryMix.horizontal(_paddingOf(size)))
      .borderRadius(BorderRadiusGeometryMix.all(AppRadii.action()))
      .labelFontSize(AppSizes.fontMd())
      .labelFontWeight(FontWeight.w600)
      .iconSize(18)
      .onDisabled(ButtonStyler().wrap(WidgetModifierConfig.opacity(AppSizes.disabledOpacity())));

  return switch (variant) {
    ButtonVariant.primary =>
      base
          .color(AppColors.primary.fill())
          .labelColor(AppColors.primary.foreground())
          .iconColor(AppColors.primary.foreground())
          .onPressed(ButtonStyler().color(AppColors.primary.interaction())),
    ButtonVariant.outline =>
      base
          .color(AppColors.action.base0())
          .border(_border(AppColors.action.border0()))
          .labelColor(AppColors.foreground())
          .iconColor(AppColors.foreground())
          .onPressed(ButtonStyler().color(AppColors.action.interaction()).border(_border(AppColors.action.border1()))),
    ButtonVariant.ghost =>
      base
          .color(const Color(0x00000000))
          .labelColor(AppColors.foreground())
          .iconColor(AppColors.foreground())
          .onPressed(ButtonStyler().color(AppColors.action.interaction())),
    ButtonVariant.danger =>
      base
          .color(AppColors.danger.fill())
          .labelColor(AppColors.danger.foreground())
          .iconColor(AppColors.danger.foreground())
          .onPressed(ButtonStyler().color(AppColors.danger.interaction())),
  };
}

/// A pill: a tab or a chip. Selected is the primary, as Joufflu has it.
ButtonStyler pillStyle({required bool selected, ControlSize size = ControlSize.sm}) {
  final base = buttonStyle(
    variant: selected ? ButtonVariant.primary : ButtonVariant.outline,
    size: size,
  ).borderRadius(BorderRadiusGeometryMix.all(AppRadii.pill())).labelFontWeight(FontWeight.w500);

  return selected ? base.border(_border(AppColors.primary.fill())) : base;
}

IconButtonStyler iconButtonStyle({ButtonVariant variant = ButtonVariant.ghost, ControlSize size = ControlSize.md}) {
  final base = IconButtonStyler()
      .size(_heightOf(size), _heightOf(size))
      .borderRadius(BorderRadiusGeometryMix.all(AppRadii.pill()))
      .iconSize(20)
      .onDisabled(IconButtonStyler().wrap(WidgetModifierConfig.opacity(AppSizes.disabledOpacity())));

  return switch (variant) {
    ButtonVariant.primary =>
      base
          .color(AppColors.primary.fill())
          .iconColor(AppColors.primary.foreground())
          .onPressed(IconButtonStyler().color(AppColors.primary.interaction())),
    ButtonVariant.outline =>
      base
          .color(AppColors.action.base0())
          .border(_border(AppColors.action.border0()))
          .iconColor(AppColors.foreground())
          .onPressed(IconButtonStyler().color(AppColors.action.interaction())),
    ButtonVariant.ghost =>
      base
          .color(AppColors.base2())
          .iconColor(AppColors.foreground())
          .onPressed(IconButtonStyler().color(AppColors.action.interaction())),
    ButtonVariant.danger =>
      base
          .color(AppColors.danger.soft())
          .iconColor(AppColors.danger.fill())
          .onPressed(IconButtonStyler().color(AppColors.danger.softInteraction())),
  };
}

TextFieldStyler textFieldStyle({bool multiline = false}) {
  final base = TextFieldStyler()
      .color(AppColors.input.base0())
      .border(_border(AppColors.input.border0()))
      .borderRadius(BorderRadiusGeometryMix.all(AppRadii.input()))
      .padding(EdgeInsetsGeometryMix.symmetric(horizontal: AppSpaces.inputPadding(), vertical: 10))
      .text(TextStyler().fontSize(AppSizes.fontMd()).color(AppColors.foreground()))
      .hintText(TextStyler().color(AppColors.muted()))
      .cursorColor(AppColors.foreground())
      .onFocused(TextFieldStyler().border(_border(AppColors.input.border1())));

  return multiline ? base : base.height(AppSizes.heightLg());
}

CheckboxStyler checkboxStyle() => CheckboxStyler()
    .size(22, 22)
    .color(AppColors.input.base0())
    .border(_border(AppColors.input.border1()))
    .borderRadius(BorderRadiusGeometryMix.all(const Radius.circular(6)))
    .indicator(IconStyler().color(AppColors.primary.foreground()).size(16))
    .onSelected(CheckboxStyler().color(AppColors.primary.fill()).border(_border(AppColors.primary.fill())));

SliderStyler sliderStyle() => SliderStyler()
    .height(28)
    .trackColor(AppColors.input.border0())
    .trackWidth(4)
    .rangeColor(AppColors.primary.fill())
    .rangeWidth(4)
    .thumb(
      BoxStyler()
          .size(22, 22)
          .color(AppColors.input.base0())
          .border(_border(AppColors.primary.fill()))
          .borderRadius(BorderRadiusGeometryMix.all(AppRadii.pill())),
    );

SpinnerStyler spinnerStyle() => SpinnerStyler().size(24).strokeWidth(2.5).indicatorColor(AppColors.foreground());

ToastStyler toastStyle() => ToastStyler()
    .color(AppColors.primary.fill())
    .borderRadius(BorderRadiusGeometryMix.all(AppRadii.display()))
    .padding(EdgeInsetsGeometryMix.all(AppSpaces.displayPadding()))
    .title(TextStyler().color(AppColors.primary.foreground()).fontSize(AppSizes.fontMd()));
