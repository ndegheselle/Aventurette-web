import 'package:aventurette/backend/index.dart';
import 'package:aventurette/features/user/api/profile.mapper.dart';

// A user may only write their own record: the backend refuses anything else.
final profileApi = writableCrud('users', userMapper);
