/// The signed-in user, what they may do, and the defaults the catalogue starts from.
library;

enum Role { user, admin }

/// What the session holds of the signed-in user: who they are, what they may do and whether they
/// have been onboarded. The rest of the record is read by the screen that needs it.
class SessionUser {
  const SessionUser({
    required this.id,
    required this.email,
    required this.name,
    required this.role,
    required this.onboarded,
  });

  final String id;
  final String email;
  final String name;
  final Role role;
  final bool onboarded;
}

/// A signed-in user who has not seen the onboarding is sent there before anything else.
bool needsOnboarding(SessionUser? user) => user != null && !user.onboarded;

// ── Sign-up ─────────────────────────────────────────────────────────────────────────────────

/// The shortest password the backend accepts.
const minPasswordLength = 8;

enum PasswordProblem { tooShort, mismatch }

/// What is wrong with the password typed at the sign-up, and its confirmation; null when
/// nothing is. Checked before the account is created, so the backend refuses neither. A short
/// password is reported before a mismatch: there is no point confirming it.
PasswordProblem? passwordProblem(String password, String confirmation) {
  if (password.length < minPasswordLength) return PasswordProblem.tooShort;
  if (password != confirmation) return PasswordProblem.mismatch;
  return null;
}

// ── Filter defaults ─────────────────────────────────────────────────────────────────────────

/// A place an activity can happen in, and a user looks for activities in. The backend spells
/// them the same on both collections.
enum Location { park, house, balcony, car, city, campaign, forest, mountain, pool, lake, river, bath, meal }

/// What the catalogue's filters start from: the ages, the number of children and the places the
/// user looks for activities in. Chosen at onboarding, changed in the preferences. A null bound
/// is unset: no limit on that side.
class FilterDefaults {
  const FilterDefaults({
    this.ageMin,
    this.ageMax,
    this.participantsMin,
    this.participantsMax,
    this.locations = const [],
  });

  final int? ageMin;
  final int? ageMax;
  final int? participantsMin;
  final int? participantsMax;
  final List<Location> locations;

  FilterDefaults copyWith({
    int? Function()? ageMin,
    int? Function()? ageMax,
    int? Function()? participantsMin,
    int? Function()? participantsMax,
    List<Location>? locations,
  }) {
    return FilterDefaults(
      ageMin: ageMin != null ? ageMin() : this.ageMin,
      ageMax: ageMax != null ? ageMax() : this.ageMax,
      participantsMin: participantsMin != null ? participantsMin() : this.participantsMin,
      participantsMax: participantsMax != null ? participantsMax() : this.participantsMax,
      locations: locations ?? this.locations,
    );
  }
}
