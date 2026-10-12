import 'package:aventurette/backend/index.dart';
import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/user/api/profile.mapper.dart';
import 'package:aventurette/features/user/model/user.dart';

/// The auth feature's gateway to the backend, typed with this app's user record.
AuthProvider<UserData> sessionProvider() => authProvider<UserData>(userMapper);
