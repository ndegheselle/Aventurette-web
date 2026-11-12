/// What a user thought of an activity once they ran it.
library;

import 'package:ajil/core/data/mapper.dart';

/// Whether they liked it, and a comment. One per user and activity, updated rather than added to.
class ActivityFeedback implements Identified {
  const ActivityFeedback({
    required this.id,
    required this.user,
    required this.activity,
    this.liked = false,
    this.comment = '',
  });

  /// Empty until the backend created it.
  @override
  final String id;
  final String user;
  final String activity;
  final bool liked;
  final String comment;
}

/// The comment to write as the user leaves: what they typed, trimmed, or null when that is what
/// is saved already. Emptying the field is a change: it takes the comment back.
String? commentToSave(String saved, String typed) {
  final comment = typed.trim();
  return comment == saved ? null : comment;
}
