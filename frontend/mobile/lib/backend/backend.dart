/// The only file of the app that names the backend adapter. Everything downstream uses the ports
/// exposed here, and only `features/*/api/` reads them.
library;

import 'package:ajil/backend/pocketbase/auth.dart';
import 'package:ajil/backend/pocketbase/client.dart';
import 'package:ajil/backend/pocketbase/crud.dart';
import 'package:ajil/core/auth/auth_provider.dart';
import 'package:ajil/core/data/crud.dart';
import 'package:riverpod/riverpod.dart';

export 'package:ajil/backend/pocketbase/client.dart' show createPocketBase, pocketBaseProvider;

final crudFactoryProvider = Provider<CrudFactory>((ref) => PocketBaseCrudFactory(ref.watch(pocketBaseProvider)));

/// The session holds these user fields and nothing more.
const sessionFields = ['id', 'email', 'name', 'avatar', 'role', 'onboarded'];

final authProviderProvider = Provider<AuthProvider>(
  (ref) => PocketBaseAuth(ref.watch(pocketBaseProvider), 'users', sessionFields),
);
