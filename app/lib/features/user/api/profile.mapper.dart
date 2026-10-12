import 'package:aventurette/core/core.dart';
import 'package:aventurette/features/user/model/user.dart';

/// A user as the backend stores it: `users` records with `email`, `name` and `role` columns.
/// The session comes back from the auth port, which expands nothing and stores no file.
class UserMapper implements WritableMapper<UserData> {
  const UserMapper();

  @override
  List<String> get relations => const [];

  @override
  UserData toEntity(JsonMap payload, FileUrlResolver files) {
    return UserData(
      id: payload['id'] as String,
      email: payload['email'] as String? ?? '',
      name: payload['name'] as String? ?? '',
      role: Role.fromWire(payload['role'] as String?),
    );
  }

  /// A user only ever writes their name: the backend refuses a body that sets the role.
  @override
  JsonMap toPayload(UserData user) => {'name': user.name};
}

const userMapper = UserMapper();
