import 'package:flutter/material.dart';

/// A message that goes away by itself.
void showAlert(BuildContext context, String message) {
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
}
