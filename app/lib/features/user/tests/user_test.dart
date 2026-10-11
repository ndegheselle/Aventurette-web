import 'package:aventurette/features/user/api/profile.mapper.dart';
import 'package:aventurette/features/user/model/user.dart';
import 'package:aventurette/testing/testing.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('userMapper', () {
    test('reads an empty role as a plain user', () {
      final user = userMapper.toEntity({'id': 'u1', 'email': 'a@b.c', 'role': ''}, FakeFileUrls());

      expect(user.role, Role.user);
    });

    test('reads a role it does not know as a plain user', () {
      final user = userMapper.toEntity({'id': 'u1', 'email': 'a@b.c', 'role': 'ROOT'}, FakeFileUrls());

      expect(user.role, Role.user);
    });

    test('writes the name and nothing else: the backend refuses a body that sets the role', () {
      expect(userMapper.toPayload(aUser(role: Role.admin)), {'name': 'Ada'});
    });
  });

  group('hasRole', () {
    test('lets anyone through when no role is asked for, signed out included', () {
      expect(hasRole(null), isTrue);
      expect(hasRole(aUser()), isTrue);
    });

    test('needs the user to hold one of the roles asked for', () {
      expect(hasRole(aUser(role: Role.admin), [Role.admin]), isTrue);
      expect(hasRole(aUser(role: Role.admin), [Role.user, Role.admin]), isTrue);
      expect(hasRole(aUser(), [Role.admin]), isFalse);
      expect(hasRole(null, [Role.admin]), isFalse);
    });
  });

  group('withProfile', () {
    test('trims the name: spaces only is no name', () {
      final user = withProfile(aUser(), ProfileForm(name: '   '));

      expect(user.name, isEmpty);
    });
  });
}
