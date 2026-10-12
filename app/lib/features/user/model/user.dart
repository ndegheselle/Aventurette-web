import 'package:aventurette/core/core.dart';

enum Role implements WireEnum {
  user('USER'),
  admin('ADMIN');

  const Role(this.wire);

  @override
  final String wire;

  /// The backend stores no role as an empty string: that is a plain user.
  static Role fromWire(String? wire) => choiceOf(Role.values, wire) ?? Role.user;
}

/// This app's user record, and what the session holds. The backend's other columns are not read.
class UserData implements BaseEntity {
  const UserData({required this.id, required this.email, this.name = '', this.role = Role.user});

  @override
  final String id;
  final String email;
  final String name;
  final Role role;

  UserData copyWith({String? name}) {
    return UserData(id: id, email: email, name: name ?? this.name, role: role);
  }
}

/// No roles asked for means anyone, signed in or not; otherwise the user must hold one of them.
bool hasRole(UserData? user, [List<Role> roles = const []]) {
  if (roles.isEmpty) return true;
  return user != null && roles.contains(user.role);
}

/// What the settings page edits of a user.
class ProfileForm {
  ProfileForm({this.name = ''});

  String name;
}

ProfileForm toProfileForm(UserData? user) => ProfileForm(name: user?.name ?? '');

/// The user once saved: a name of spaces only is no name.
UserData withProfile(UserData user, ProfileForm form) => user.copyWith(name: form.name.trim());
