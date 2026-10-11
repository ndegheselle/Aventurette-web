import 'package:aventurette/app/i18n.dart';
import 'package:aventurette/core/utils/debounce.dart';
import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// A search field. `onSearch` fires once typing pauses, not on every key.
class SearchInput extends StatefulWidget {
  const SearchInput({super.key, required this.onSearch});

  final ValueChanged<String> onSearch;

  @override
  State<SearchInput> createState() => _SearchInputState();
}

class _SearchInputState extends State<SearchInput> {
  final _controller = TextEditingController();
  final _debouncer = Debouncer();

  @override
  void dispose() {
    _controller.dispose();
    _debouncer.dispose();
    super.dispose();
  }

  void _clear() {
    _controller.clear();
    widget.onSearch('');
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      onChanged: (value) => _debouncer.run(() => widget.onSearch(value)),
      decoration: InputDecoration(
        hintText: context.t('actions.search'),
        prefixIcon: const Icon(LucideIcons.search),
        suffixIcon: ListenableBuilder(
          listenable: _controller,
          builder: (context, _) => _controller.text.isEmpty
              ? const SizedBox.shrink()
              : IconButton(icon: const Icon(LucideIcons.x), onPressed: _clear),
        ),
      ),
    );
  }
}
