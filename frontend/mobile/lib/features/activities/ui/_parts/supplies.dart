import 'package:ajil/features/activities/models/step.dart';
import 'package:ajil/ui/async/run_action.dart';
import 'package:ajil/ui/i18n/strings.g.dart';
import 'package:ajil/ui/overlays/sheet.dart';
import 'package:ajil/ui/theme/text.dart';
import 'package:flutter/widgets.dart';
import 'package:forui/forui.dart';
import 'package:url_launcher/url_launcher.dart';

const _tileSize = 80.0;

/// What an activity or a step uses — materials, then resources — as square tiles on one line
/// that scrolls: a picture on top, the name and its quantity below. Only an image resource has a
/// picture of its own; the rest show an icon in its place. A tile opens its details.
class Supplies extends StatelessWidget {
  const Supplies({super.key, required this.materials, required this.resources});

  final List<ActivityMaterial> materials;
  final List<StepResource> resources;

  @override
  Widget build(BuildContext context) {
    if (materials.isEmpty && resources.isEmpty) return const SizedBox.shrink();

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        spacing: 8,
        children: [
          for (final material in materials)
            _Tile(
              name: material.name,
              detail: material.quantity,
              picture: _Icon(FLucideIcons.package),
              onTap: () => _showMaterial(context, material),
            ),
          for (final resource in resources)
            _Tile(
              name: resource.name,
              picture: pictureOf(resource).isEmpty ? _Icon(FLucideIcons.fileText) : _Picture(pictureOf(resource)),
              onTap: () => _showResource(context, resource),
            ),
        ],
      ),
    );
  }

  void _showMaterial(BuildContext context, ActivityMaterial material) {
    final t = context.t.activities.sheet;
    showAppSheet<void>(
      context,
      title: material.name,
      builder: (_) => Column(
        spacing: 12,
        children: [
          SizedBox.square(dimension: 128, child: _Icon(FLucideIcons.package, size: 56)),
          if (material.quantity.isNotEmpty) ...[
            Text(t.quantity, style: context.captionText),
            Text(material.quantity, style: context.bodyText),
          ],
        ],
      ),
    );
  }

  void _showResource(BuildContext context, StepResource resource) {
    final picture = pictureOf(resource);
    showAppSheet<void>(
      context,
      title: resource.name,
      builder: (_) => picture.isEmpty
          ? SizedBox.square(dimension: 128, child: _Icon(FLucideIcons.fileText, size: 56))
          : ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(picture, fit: BoxFit.contain),
            ),
      actionsBuilder: (sheetContext) => FButton(
        size: .lg,
        prefix: const Icon(FLucideIcons.externalLink),
        onPress: () => runAction(sheetContext, () => launchUrl(Uri.parse(resource.url))),
        child: Text(sheetContext.t.activities.sheet.openResource),
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.name, required this.picture, required this.onTap, this.detail = ''});

  final String name;
  final String detail;
  final Widget picture;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: name,
      excludeSemantics: true,
      child: GestureDetector(
        onTap: onTap,
        child: SizedBox(
          width: _tileSize,
          child: Column(
            spacing: 4,
            children: [
              SizedBox.square(dimension: _tileSize, child: picture),
              Text(
                name,
                style: context.labelText.copyWith(fontWeight: FontWeight.w500),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              if (detail.isNotEmpty)
                Text(detail, style: context.captionText, maxLines: 1, overflow: TextOverflow.ellipsis),
            ],
          ),
        ),
      ),
    );
  }
}

class _Icon extends StatelessWidget {
  const _Icon(this.icon, {this.size = 32});

  final IconData icon;
  final double size;

  @override
  Widget build(BuildContext context) {
    final colors = context.theme.colors;

    return DecoratedBox(
      decoration: BoxDecoration(color: colors.muted, borderRadius: context.theme.style.borderRadius.lg),
      child: Center(
        child: Icon(icon, size: size, color: colors.mutedForeground),
      ),
    );
  }
}

class _Picture extends StatelessWidget {
  const _Picture(this.url);

  final String url;

  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: context.theme.style.borderRadius.lg,
    child: Image.network(url, fit: BoxFit.cover),
  );
}
