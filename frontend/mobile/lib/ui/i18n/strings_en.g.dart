///
/// Generated file. Do not edit.
///
// coverage:ignore-file
// ignore_for_file: type=lint, unused_import
// dart format off

import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';
import 'package:slang/generated.dart';
import 'strings.g.dart';

// Path: <root>
class TranslationsEn extends Translations with BaseTranslations<AppLocale, Translations> {
	/// You can call this constructor and build your own translation instance of this locale.
	/// Constructing via the enum [AppLocale.build] is preferred.
	TranslationsEn({Map<String, Node>? overrides, PluralResolver? cardinalResolver, PluralResolver? ordinalResolver, TranslationMetadata<AppLocale, Translations>? meta})
		: assert(overrides == null, 'Set "translation_overrides: true" in order to enable this feature.'),
		  _meta = meta ?? TranslationMetadata(
		    locale: AppLocale.en,
		    overrides: overrides ?? {},
		    cardinalResolver: cardinalResolver,
		    ordinalResolver: ordinalResolver,
		  ),
		  super(cardinalResolver: cardinalResolver, ordinalResolver: ordinalResolver) {
		_meta.setFlatMapFunction(_flatMapFunction);
	}

	/// Metadata for the translations of <en>.
	final TranslationMetadata<AppLocale, Translations> _meta;
	@override TranslationMetadata<AppLocale, Translations> get $meta => _meta;

	/// Access flat map
	@override dynamic operator[](String key) => _meta.getTranslation(key) ?? super[key];

	late final TranslationsEn _root = this; // ignore: unused_field

	@override 
	TranslationsEn $copyWith({TranslationMetadata<AppLocale, Translations>? meta}) => TranslationsEn(meta: meta ?? this.$meta);

	// Translations
	@override late final _Translations$activities$en activities = _Translations$activities$en._(_root);
	@override late final _Translations$activityEditor$en activityEditor = _Translations$activityEditor$en._(_root);
	@override late final _Translations$app$en app = _Translations$app$en._(_root);
	@override late final _Translations$create$en create = _Translations$create$en._(_root);
	@override late final _Translations$dayTemplates$en dayTemplates = _Translations$dayTemplates$en._(_root);
	@override late final _Translations$events$en events = _Translations$events$en._(_root);
	@override late final _Translations$followUp$en followUp = _Translations$followUp$en._(_root);
	@override late final _Translations$inventory$en inventory = _Translations$inventory$en._(_root);
	@override late final _Translations$notifications$en notifications = _Translations$notifications$en._(_root);
	@override late final _Translations$pedagogy$en pedagogy = _Translations$pedagogy$en._(_root);
	@override late final _Translations$resources$en resources = _Translations$resources$en._(_root);
	@override late final _Translations$reviews$en reviews = _Translations$reviews$en._(_root);
	@override late final _Translations$sharing$en sharing = _Translations$sharing$en._(_root);
	@override late final _Translations$structures$en structures = _Translations$structures$en._(_root);
	@override late final _Translations$tasks$en tasks = _Translations$tasks$en._(_root);
	@override late final _Translations$threads$en threads = _Translations$threads$en._(_root);
	@override late final _Translations$ui$en ui = _Translations$ui$en._(_root);
	@override late final _Translations$user$en user = _Translations$user$en._(_root);
	@override late final _Translations$validations$en validations = _Translations$validations$en._(_root);
}

// Path: activities
class _Translations$activities$en extends Translations$activities$fr {
	_Translations$activities$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String minutes({required Object minutes}) => '${minutes} min';
	@override late final _Translations$activities$catalogue$en catalogue = _Translations$activities$catalogue$en._(_root);
	@override late final _Translations$activities$filters$en filters = _Translations$activities$filters$en._(_root);
	@override late final _Translations$activities$fields$en fields = _Translations$activities$fields$en._(_root);
	@override Map<String, String> get format => {
		'smallGame': 'Small game',
		'bigGame': 'Big game',
		'workshop': 'Workshop',
	};
	@override Map<String, String> get practice => {
		'manualCreation': 'Crafts',
		'expression': 'Expression',
		'cooking': 'Cooking',
		'observation': 'Observation',
		'music': 'Music',
		'experimentation': 'Experimentation',
	};
	@override Map<String, String> get imaginaryRule => {
		'none': 'No imaginary needed',
		'adaptable': 'Adaptable setting',
		'required': 'Imaginary required',
	};
	@override Map<String, String> get childrenPace => {
		'calm': 'Calm',
		'dynamic': 'Lively',
	};
	@override Map<String, String> get hostEffort => {
		'low': 'Low',
		'medium': 'Medium',
		'high': 'High',
	};
	@override Map<String, String> get season => {
		'autumn': 'Autumn',
		'winter': 'Winter',
		'spring': 'Spring',
		'summer': 'Summer',
	};
	@override Map<String, String> get stepKind => {
		'prepare': 'Set up the game',
		'custom': 'Free step',
		'conclusion': 'Conclusion',
	};
	@override late final _Translations$activities$sheet$en sheet = _Translations$activities$sheet$en._(_root);
	@override late final _Translations$activities$actions$en actions = _Translations$activities$actions$en._(_root);
	@override late final _Translations$activities$favorites$en favorites = _Translations$activities$favorites$en._(_root);
	@override late final _Translations$activities$run$en run = _Translations$activities$run$en._(_root);
	@override late final _Translations$activities$feedback$en feedback = _Translations$activities$feedback$en._(_root);
	@override late final _Translations$activities$preparation$en preparation = _Translations$activities$preparation$en._(_root);
	@override late final _Translations$activities$screens$en screens = _Translations$activities$screens$en._(_root);
}

// Path: activityEditor
class _Translations$activityEditor$en extends Translations$activityEditor$fr {
	_Translations$activityEditor$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$activityEditor$screens$en screens = _Translations$activityEditor$screens$en._(_root);
}

// Path: app
class _Translations$app$en extends Translations$app$fr {
	_Translations$app$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$app$dock$en dock = _Translations$app$dock$en._(_root);
}

// Path: create
class _Translations$create$en extends Translations$create$fr {
	_Translations$create$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$create$screens$en screens = _Translations$create$screens$en._(_root);
}

// Path: dayTemplates
class _Translations$dayTemplates$en extends Translations$dayTemplates$fr {
	_Translations$dayTemplates$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$dayTemplates$screens$en screens = _Translations$dayTemplates$screens$en._(_root);
}

// Path: events
class _Translations$events$en extends Translations$events$fr {
	_Translations$events$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$events$screens$en screens = _Translations$events$screens$en._(_root);
}

// Path: followUp
class _Translations$followUp$en extends Translations$followUp$fr {
	_Translations$followUp$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$followUp$screens$en screens = _Translations$followUp$screens$en._(_root);
}

// Path: inventory
class _Translations$inventory$en extends Translations$inventory$fr {
	_Translations$inventory$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$inventory$screens$en screens = _Translations$inventory$screens$en._(_root);
}

// Path: notifications
class _Translations$notifications$en extends Translations$notifications$fr {
	_Translations$notifications$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$notifications$screens$en screens = _Translations$notifications$screens$en._(_root);
}

// Path: pedagogy
class _Translations$pedagogy$en extends Translations$pedagogy$fr {
	_Translations$pedagogy$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$pedagogy$screens$en screens = _Translations$pedagogy$screens$en._(_root);
}

// Path: resources
class _Translations$resources$en extends Translations$resources$fr {
	_Translations$resources$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$resources$screens$en screens = _Translations$resources$screens$en._(_root);
}

// Path: reviews
class _Translations$reviews$en extends Translations$reviews$fr {
	_Translations$reviews$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$reviews$screens$en screens = _Translations$reviews$screens$en._(_root);
}

// Path: sharing
class _Translations$sharing$en extends Translations$sharing$fr {
	_Translations$sharing$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$sharing$screens$en screens = _Translations$sharing$screens$en._(_root);
}

// Path: structures
class _Translations$structures$en extends Translations$structures$fr {
	_Translations$structures$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$structures$screens$en screens = _Translations$structures$screens$en._(_root);
}

// Path: tasks
class _Translations$tasks$en extends Translations$tasks$fr {
	_Translations$tasks$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$tasks$screens$en screens = _Translations$tasks$screens$en._(_root);
}

// Path: threads
class _Translations$threads$en extends Translations$threads$fr {
	_Translations$threads$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$threads$screens$en screens = _Translations$threads$screens$en._(_root);
}

// Path: ui
class _Translations$ui$en extends Translations$ui$fr {
	_Translations$ui$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$ui$actions$en actions = _Translations$ui$actions$en._(_root);
	@override late final _Translations$ui$comingSoon$en comingSoon = _Translations$ui$comingSoon$en._(_root);
	@override late final _Translations$ui$errors$en errors = _Translations$ui$errors$en._(_root);
	@override String get search => 'Search';
	@override late final _Translations$ui$range$en range = _Translations$ui$range$en._(_root);
}

// Path: user
class _Translations$user$en extends Translations$user$fr {
	_Translations$user$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$user$login$en login = _Translations$user$login$en._(_root);
	@override late final _Translations$user$onboarding$en onboarding = _Translations$user$onboarding$en._(_root);
	@override late final _Translations$user$filterDefaults$en filterDefaults = _Translations$user$filterDefaults$en._(_root);
	@override Map<String, String> get location => {
		'park': 'Playground',
		'house': 'House',
		'balcony': 'Balcony',
		'car': 'Car',
		'city': 'City',
		'campaign': 'Countryside',
		'forest': 'Forest',
		'mountain': 'Mountain',
		'pool': 'Swimming pool',
		'lake': 'Lake',
		'river': 'River',
		'bath': 'Bath',
		'meal': 'Meal',
	};
	@override late final _Translations$user$menu$en menu = _Translations$user$menu$en._(_root);
	@override late final _Translations$user$preferences$en preferences = _Translations$user$preferences$en._(_root);
	@override late final _Translations$user$account$en account = _Translations$user$account$en._(_root);
	@override late final _Translations$user$contents$en contents = _Translations$user$contents$en._(_root);
}

// Path: validations
class _Translations$validations$en extends Translations$validations$fr {
	_Translations$validations$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override late final _Translations$validations$screens$en screens = _Translations$validations$screens$en._(_root);
}

// Path: activities.catalogue
class _Translations$activities$catalogue$en extends Translations$activities$catalogue$fr {
	_Translations$activities$catalogue$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'Catalogue';
	@override String get searchHint => 'A game, an idea, a goal…';
	@override String get empty => 'No activity matches your search. Try widening your filters.';
	@override String get favoritesEmpty => 'No saved activity yet. Tap an activity\'s heart to find it here.';
	@override Map<String, String> get segments => {
		'all': 'All',
		'favorites': 'Favorites',
		'mine': 'My creations',
		'shared': 'Shared with me',
	};
}

// Path: activities.filters
class _Translations$activities$filters$en extends Translations$activities$filters$fr {
	_Translations$activities$filters$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'Filters';
	@override String get open => 'Filter activities';
	@override String get any => 'Any';
	@override String locations({required Object count}) => '${count} places';
	@override late final _Translations$activities$filters$age$en age = _Translations$activities$filters$age$en._(_root);
	@override late final _Translations$activities$filters$participants$en participants = _Translations$activities$filters$participants$en._(_root);
	@override late final _Translations$activities$filters$profile$en profile = _Translations$activities$filters$profile$en._(_root);
	@override Map<String, String> get quick => {
		'age': 'Age',
		'participants': 'Children',
		'location': 'Place',
	};
}

// Path: activities.fields
class _Translations$activities$fields$en extends Translations$activities$fields$fr {
	_Translations$activities$fields$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get format => 'Format';
	@override String get practices => 'Practice (workshop)';
	@override String get imaginaryRule => 'Imaginary rule';
	@override String get age => 'Age';
	@override String get participants => 'Recommended group size';
	@override String get childrenPace => 'Children\'s pace';
	@override String get hostEffort => 'Leader involvement';
	@override String get hosts => 'Leaders required';
	@override String get crossSupervision => 'Supervision across workshops';
	@override String get place => 'Place';
	@override String get indoor => 'Indoor';
	@override String get outdoor => 'Outdoor';
	@override String get locations => 'Detailed location';
	@override String get seasons => 'Seasons';
	@override String get safetyInstructions => 'Safety instructions';
	@override String get preparationTime => 'Preparation time';
	@override String get playTime => 'Play time';
	@override String get totalTime => 'Total time';
	@override String get themes => 'Theme';
	@override String get universes => 'Imaginary';
	@override String get goals => 'Pedagogical tags';
	@override String get idealFor => 'Ideal for…';
	@override String get yes => 'Yes';
}

// Path: activities.sheet
class _Translations$activities$sheet$en extends Translations$activities$sheet$fr {
	_Translations$activities$sheet$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String participants({required Object count}) => '${count} players';
	@override String participantsRange({required Object min, required Object max}) => '${min}–${max} players';
	@override String hosts({required Object count}) => '${count} leader(s)';
	@override String get preparation => 'Preparation and materials';
	@override String get preparationHint => 'Materials, set-up and resources';
	@override String get details => 'Details';
	@override String get more => 'Show more';
	@override String get less => 'Show less';
	@override String get steps => 'Steps';
	@override String get supplies => 'Materials and resources';
	@override String get workshops => 'Workshops';
	@override String adults({required Object count}) => '${count} adult(s)';
	@override String get quantity => 'Quantity';
	@override String get openResource => 'Open the resource';
}

// Path: activities.actions
class _Translations$activities$actions$en extends Translations$activities$actions$fr {
	_Translations$activities$actions$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get share => 'Share';
	@override String get edit => 'Edit';
	@override String get save => 'Save';
	@override String get saved => 'Saved';
	@override String get guided => 'Guided mode';
	@override String get quickMode => 'Quick mode';
}

// Path: activities.favorites
class _Translations$activities$favorites$en extends Translations$activities$favorites$fr {
	_Translations$activities$favorites$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get added => 'Activity saved';
	@override String get removed => 'Activity removed from favorites';
	@override String get undo => 'Undo';
}

// Path: activities.run
class _Translations$activities$run$en extends Translations$activities$run$fr {
	_Translations$activities$run$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String step({required Object current, required Object total}) => 'Step ${current} / ${total}';
	@override String get previous => 'Previous';
	@override String get next => 'Next';
	@override String get finish => 'Finish';
	@override String get empty => 'This activity has no step yet.';
	@override String get instructions => 'Instructions';
	@override String get tips => 'Tips';
	@override String get supplies => 'Materials for this step';
}

// Path: activities.feedback
class _Translations$activities$feedback$en extends Translations$activities$feedback$fr {
	_Translations$activities$feedback$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get bravo => 'Well done!';
	@override String finished({required Object name}) => 'You finished “${name}”.';
	@override String get like => 'I like this activity';
	@override String get comment => 'Any comment?';
	@override String get commentPlaceholder => 'What worked, what didn\'t…';
	@override String get leave => 'Leave';
	@override String get saveRefused => 'Your feedback could not be saved.';
}

// Path: activities.preparation
class _Translations$activities$preparation$en extends Translations$activities$preparation$fr {
	_Translations$activities$preparation$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'Preparation';
	@override Map<String, String> get tabs => {
		'materials': 'Materials',
		'setup': 'Set-up',
		'advice': 'Advice',
	};
	@override String workshop({required Object name}) => 'Workshop · ${name}';
	@override String get resources => 'Resources';
	@override String setupTotal({required Object minutes}) => 'Set-up · ${minutes} min';
	@override String get safety => 'Safety';
	@override String get tips => 'Tips';
	@override String get noMaterials => 'This activity needs no materials.';
	@override String get noSetup => 'Nothing to set up before the game.';
	@override String get noAdvice => 'No particular advice for this activity.';
	@override String get hint => 'This preparation feeds the event\'s tasks, assigned from Planning.';
	@override String get back => 'Back to the sheet';
}

// Path: activities.screens
class _Translations$activities$screens$en extends Translations$activities$screens$fr {
	_Translations$activities$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get quick => 'Quick mode';
}

// Path: activityEditor.screens
class _Translations$activityEditor$screens$en extends Translations$activityEditor$screens$fr {
	_Translations$activityEditor$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get create => 'New activity';
	@override String get edit => 'Edit the activity';
}

// Path: app.dock
class _Translations$app$dock$en extends Translations$app$dock$fr {
	_Translations$app$dock$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get catalogue => 'Catalogue';
	@override String get planning => 'Planning';
	@override String get create => 'Create';
	@override String get followUp => 'Follow-up';
	@override String get pedagogy => 'Pedagogy';
}

// Path: create.screens
class _Translations$create$screens$en extends Translations$create$screens$fr {
	_Translations$create$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get tab => 'Create';
}

// Path: dayTemplates.screens
class _Translations$dayTemplates$screens$en extends Translations$dayTemplates$screens$fr {
	_Translations$dayTemplates$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get template => 'Day template';
	@override String get edit => 'Edit the day template';
	@override String get visibility => 'Templates';
}

// Path: events.screens
class _Translations$events$screens$en extends Translations$events$screens$fr {
	_Translations$events$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get tab => 'Planning';
	@override String get create => 'New event';
	@override String get event => 'Event';
	@override String get edit => 'Edit the event';
	@override String get newBlock => 'Set up the time';
	@override String get coordination => 'Coordination';
}

// Path: followUp.screens
class _Translations$followUp$screens$en extends Translations$followUp$screens$fr {
	_Translations$followUp$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get tab => 'Follow-up';
}

// Path: inventory.screens
class _Translations$inventory$screens$en extends Translations$inventory$screens$fr {
	_Translations$inventory$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get inventory => 'Inventory';
}

// Path: notifications.screens
class _Translations$notifications$screens$en extends Translations$notifications$screens$fr {
	_Translations$notifications$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get preferences => 'Notifications';
	@override String get inbox => 'My notifications';
}

// Path: pedagogy.screens
class _Translations$pedagogy$screens$en extends Translations$pedagogy$screens$fr {
	_Translations$pedagogy$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get tab => 'Pedagogy';
}

// Path: resources.screens
class _Translations$resources$screens$en extends Translations$resources$screens$fr {
	_Translations$resources$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get list => 'Resources';
	@override String get resource => 'Resource';
}

// Path: reviews.screens
class _Translations$reviews$screens$en extends Translations$reviews$screens$fr {
	_Translations$reviews$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get review => 'Review';
	@override String get report => 'Report';
}

// Path: sharing.screens
class _Translations$sharing$screens$en extends Translations$sharing$screens$fr {
	_Translations$sharing$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get dossier => 'Dossier contents';
	@override String get preview => 'Dossier preview';
	@override String get link => 'Share a link';
}

// Path: structures.screens
class _Translations$structures$screens$en extends Translations$structures$screens$fr {
	_Translations$structures$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get settings => 'Settings';
	@override String get structures => 'Structures';
	@override String get permissions => 'Permissions';
}

// Path: tasks.screens
class _Translations$tasks$screens$en extends Translations$tasks$screens$fr {
	_Translations$tasks$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get preparation => 'Preparation';
	@override String get task => 'My task';
}

// Path: threads.screens
class _Translations$threads$screens$en extends Translations$threads$screens$fr {
	_Translations$threads$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get list => 'Guiding threads';
	@override String get thread => 'Guiding thread';
}

// Path: ui.actions
class _Translations$ui$actions$en extends Translations$ui$actions$fr {
	_Translations$ui$actions$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get save => 'Save';
	@override String get cancel => 'Cancel';
	@override String get back => 'Back';
	@override String get close => 'Close';
	@override String get retry => 'Try again';
	@override String get apply => 'Apply';
	@override String get reset => 'Reset';
	@override late final _Translations$ui$actions$results$en results = _Translations$ui$actions$results$en._(_root);
}

// Path: ui.comingSoon
class _Translations$ui$comingSoon$en extends Translations$ui$comingSoon$fr {
	_Translations$ui$comingSoon$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'Coming soon';
	@override String get body => 'This screen is not built yet.';
	@override String wireframe({required Object id}) => 'Wireframe ${id}';
}

// Path: ui.errors
class _Translations$ui$errors$en extends Translations$ui$errors$fr {
	_Translations$ui$errors$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get generic => 'Something went wrong.';
}

// Path: ui.range
class _Translations$ui$range$en extends Translations$ui$range$fr {
	_Translations$ui$range$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get any => 'Any';
	@override String from({required Object min}) => '${min} and more';
	@override String upTo({required Object max}) => 'Up to ${max}';
	@override String between({required Object min, required Object max}) => 'From ${min} to ${max}';
	@override String exactly({required Object min}) => '${min}';
}

// Path: user.login
class _Translations$user$login$en extends Translations$user$login$fr {
	_Translations$user$login$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'Sign in';
	@override String get email => 'Email';
	@override String get code => 'Sign-in code';
	@override String get sendCode => 'Send me a code';
	@override String codeSentTo({required Object email}) => 'A sign-in code was sent to ${email}. It is valid for 10 minutes.';
	@override String get changeEmail => 'Change email';
	@override String get codeNotSent => 'The code could not be sent.';
	@override String get codeRejected => 'Invalid or expired code.';
	@override String get password => 'Password';
	@override String get withPassword => 'Sign in with the password';
	@override String get passwordRejected => 'Wrong email or password.';
}

// Path: user.onboarding
class _Translations$user$onboarding$en extends Translations$user$onboarding$fr {
	_Translations$user$onboarding$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'Welcome!';
	@override String get intro => 'Pick the catalogue\'s default filters. You can change them at any time in your preferences.';
	@override String get later => 'Later';
}

// Path: user.filterDefaults
class _Translations$user$filterDefaults$en extends Translations$user$filterDefaults$fr {
	_Translations$user$filterDefaults$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'Default filters';
	@override String get help => 'What the catalogue filters on first.';
	@override String get age => 'Age (years)';
	@override String get participants => 'Number of children';
	@override String get locations => 'Places';
}

// Path: user.menu
class _Translations$user$menu$en extends Translations$user$menu$fr {
	_Translations$user$menu$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'My space';
	@override String get contents => 'My content';
	@override String get preferences => 'My preferences';
	@override String get account => 'My account';
	@override String get settings => 'Settings';
	@override String get notifications => 'Notifications';
	@override String get open => 'Open my space';
}

// Path: user.preferences
class _Translations$user$preferences$en extends Translations$user$preferences$fr {
	_Translations$user$preferences$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'My preferences';
	@override String get language => 'Language';
	@override String get theme => 'Theme';
	@override String get saved => 'Preferences saved';
	@override Map<String, String> get languages => {
		'device': 'Device language',
		'fr': 'Français',
		'en': 'English',
	};
	@override Map<String, String> get themes => {
		'auto': 'Automatic',
		'light': 'Light',
		'dark': 'Dark',
	};
}

// Path: user.account
class _Translations$user$account$en extends Translations$user$account$fr {
	_Translations$user$account$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'My account';
	@override String get name => 'Name';
	@override String get email => 'Email address';
	@override String get logout => 'Sign out';
	@override String get logoutConfirm => 'Do you really want to sign out?';
}

// Path: user.contents
class _Translations$user$contents$en extends Translations$user$contents$fr {
	_Translations$user$contents$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'My content';
}

// Path: validations.screens
class _Translations$validations$screens$en extends Translations$validations$screens$fr {
	_Translations$validations$screens$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get event => 'Validate the event';
	@override String get adjust => 'Ask for a change';
}

// Path: activities.filters.age
class _Translations$activities$filters$age$en extends Translations$activities$filters$age$fr {
	_Translations$activities$filters$age$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String from({required Object min}) => '${min} years and up';
	@override String upTo({required Object max}) => 'Up to ${max} years';
	@override String between({required Object min, required Object max}) => '${min}–${max} years';
	@override String exactly({required Object min}) => '${min} years';
}

// Path: activities.filters.participants
class _Translations$activities$filters$participants$en extends Translations$activities$filters$participants$fr {
	_Translations$activities$filters$participants$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String from({required Object min}) => '${min} children and up';
	@override String upTo({required Object max}) => 'Up to ${max} children';
	@override String between({required Object min, required Object max}) => '${min}–${max} children';
	@override String exactly({required Object min}) => '${min} children';
}

// Path: activities.filters.profile
class _Translations$activities$filters$profile$en extends Translations$activities$filters$profile$fr {
	_Translations$activities$filters$profile$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get title => 'Apply my profile';
	@override String get help => 'The age, number of children and places from your preferences.';
	@override String get empty => 'Your preferences have no default filters yet.';
}

// Path: ui.actions.results
class _Translations$ui$actions$results$en extends Translations$ui$actions$results$fr {
	_Translations$ui$actions$results$en._(TranslationsEn root) : this._root = root, super.internal(root);

	final TranslationsEn _root; // ignore: unused_field

	// Translations
	@override String get saved => 'Saved';
}

/// The flat map containing all translations for locale <en>.
/// Only for edge cases! For simple maps, use the map function of this library.
///
/// The Dart AOT compiler has issues with very large switch statements,
/// so the map is split into smaller functions (512 entries each).
extension on TranslationsEn {
	dynamic _flatMapFunction(String path) {
		return switch (path) {
			'activities.minutes' => ({required Object minutes}) => '${minutes} min',
			'activities.catalogue.title' => 'Catalogue',
			'activities.catalogue.searchHint' => 'A game, an idea, a goal…',
			'activities.catalogue.empty' => 'No activity matches your search. Try widening your filters.',
			'activities.catalogue.favoritesEmpty' => 'No saved activity yet. Tap an activity\'s heart to find it here.',
			'activities.catalogue.segments.all' => 'All',
			'activities.catalogue.segments.favorites' => 'Favorites',
			'activities.catalogue.segments.mine' => 'My creations',
			'activities.catalogue.segments.shared' => 'Shared with me',
			'activities.filters.title' => 'Filters',
			'activities.filters.open' => 'Filter activities',
			'activities.filters.any' => 'Any',
			'activities.filters.locations' => ({required Object count}) => '${count} places',
			'activities.filters.age.from' => ({required Object min}) => '${min} years and up',
			'activities.filters.age.upTo' => ({required Object max}) => 'Up to ${max} years',
			'activities.filters.age.between' => ({required Object min, required Object max}) => '${min}–${max} years',
			'activities.filters.age.exactly' => ({required Object min}) => '${min} years',
			'activities.filters.participants.from' => ({required Object min}) => '${min} children and up',
			'activities.filters.participants.upTo' => ({required Object max}) => 'Up to ${max} children',
			'activities.filters.participants.between' => ({required Object min, required Object max}) => '${min}–${max} children',
			'activities.filters.participants.exactly' => ({required Object min}) => '${min} children',
			'activities.filters.profile.title' => 'Apply my profile',
			'activities.filters.profile.help' => 'The age, number of children and places from your preferences.',
			'activities.filters.profile.empty' => 'Your preferences have no default filters yet.',
			'activities.filters.quick.age' => 'Age',
			'activities.filters.quick.participants' => 'Children',
			'activities.filters.quick.location' => 'Place',
			'activities.fields.format' => 'Format',
			'activities.fields.practices' => 'Practice (workshop)',
			'activities.fields.imaginaryRule' => 'Imaginary rule',
			'activities.fields.age' => 'Age',
			'activities.fields.participants' => 'Recommended group size',
			'activities.fields.childrenPace' => 'Children\'s pace',
			'activities.fields.hostEffort' => 'Leader involvement',
			'activities.fields.hosts' => 'Leaders required',
			'activities.fields.crossSupervision' => 'Supervision across workshops',
			'activities.fields.place' => 'Place',
			'activities.fields.indoor' => 'Indoor',
			'activities.fields.outdoor' => 'Outdoor',
			'activities.fields.locations' => 'Detailed location',
			'activities.fields.seasons' => 'Seasons',
			'activities.fields.safetyInstructions' => 'Safety instructions',
			'activities.fields.preparationTime' => 'Preparation time',
			'activities.fields.playTime' => 'Play time',
			'activities.fields.totalTime' => 'Total time',
			'activities.fields.themes' => 'Theme',
			'activities.fields.universes' => 'Imaginary',
			'activities.fields.goals' => 'Pedagogical tags',
			'activities.fields.idealFor' => 'Ideal for…',
			'activities.fields.yes' => 'Yes',
			'activities.format.smallGame' => 'Small game',
			'activities.format.bigGame' => 'Big game',
			'activities.format.workshop' => 'Workshop',
			'activities.practice.manualCreation' => 'Crafts',
			'activities.practice.expression' => 'Expression',
			'activities.practice.cooking' => 'Cooking',
			'activities.practice.observation' => 'Observation',
			'activities.practice.music' => 'Music',
			'activities.practice.experimentation' => 'Experimentation',
			'activities.imaginaryRule.none' => 'No imaginary needed',
			'activities.imaginaryRule.adaptable' => 'Adaptable setting',
			'activities.imaginaryRule.required' => 'Imaginary required',
			'activities.childrenPace.calm' => 'Calm',
			'activities.childrenPace.dynamic' => 'Lively',
			'activities.hostEffort.low' => 'Low',
			'activities.hostEffort.medium' => 'Medium',
			'activities.hostEffort.high' => 'High',
			'activities.season.autumn' => 'Autumn',
			'activities.season.winter' => 'Winter',
			'activities.season.spring' => 'Spring',
			'activities.season.summer' => 'Summer',
			'activities.stepKind.prepare' => 'Set up the game',
			'activities.stepKind.custom' => 'Free step',
			'activities.stepKind.conclusion' => 'Conclusion',
			'activities.sheet.participants' => ({required Object count}) => '${count} players',
			'activities.sheet.participantsRange' => ({required Object min, required Object max}) => '${min}–${max} players',
			'activities.sheet.hosts' => ({required Object count}) => '${count} leader(s)',
			'activities.sheet.preparation' => 'Preparation and materials',
			'activities.sheet.preparationHint' => 'Materials, set-up and resources',
			'activities.sheet.details' => 'Details',
			'activities.sheet.more' => 'Show more',
			'activities.sheet.less' => 'Show less',
			'activities.sheet.steps' => 'Steps',
			'activities.sheet.supplies' => 'Materials and resources',
			'activities.sheet.workshops' => 'Workshops',
			'activities.sheet.adults' => ({required Object count}) => '${count} adult(s)',
			'activities.sheet.quantity' => 'Quantity',
			'activities.sheet.openResource' => 'Open the resource',
			'activities.actions.share' => 'Share',
			'activities.actions.edit' => 'Edit',
			'activities.actions.save' => 'Save',
			'activities.actions.saved' => 'Saved',
			'activities.actions.guided' => 'Guided mode',
			'activities.actions.quickMode' => 'Quick mode',
			'activities.favorites.added' => 'Activity saved',
			'activities.favorites.removed' => 'Activity removed from favorites',
			'activities.favorites.undo' => 'Undo',
			'activities.run.step' => ({required Object current, required Object total}) => 'Step ${current} / ${total}',
			'activities.run.previous' => 'Previous',
			'activities.run.next' => 'Next',
			'activities.run.finish' => 'Finish',
			'activities.run.empty' => 'This activity has no step yet.',
			'activities.run.instructions' => 'Instructions',
			'activities.run.tips' => 'Tips',
			'activities.run.supplies' => 'Materials for this step',
			'activities.feedback.bravo' => 'Well done!',
			'activities.feedback.finished' => ({required Object name}) => 'You finished “${name}”.',
			'activities.feedback.like' => 'I like this activity',
			'activities.feedback.comment' => 'Any comment?',
			'activities.feedback.commentPlaceholder' => 'What worked, what didn\'t…',
			'activities.feedback.leave' => 'Leave',
			'activities.feedback.saveRefused' => 'Your feedback could not be saved.',
			'activities.preparation.title' => 'Preparation',
			'activities.preparation.tabs.materials' => 'Materials',
			'activities.preparation.tabs.setup' => 'Set-up',
			'activities.preparation.tabs.advice' => 'Advice',
			'activities.preparation.workshop' => ({required Object name}) => 'Workshop · ${name}',
			'activities.preparation.resources' => 'Resources',
			'activities.preparation.setupTotal' => ({required Object minutes}) => 'Set-up · ${minutes} min',
			'activities.preparation.safety' => 'Safety',
			'activities.preparation.tips' => 'Tips',
			'activities.preparation.noMaterials' => 'This activity needs no materials.',
			'activities.preparation.noSetup' => 'Nothing to set up before the game.',
			'activities.preparation.noAdvice' => 'No particular advice for this activity.',
			'activities.preparation.hint' => 'This preparation feeds the event\'s tasks, assigned from Planning.',
			'activities.preparation.back' => 'Back to the sheet',
			'activities.screens.quick' => 'Quick mode',
			'activityEditor.screens.create' => 'New activity',
			'activityEditor.screens.edit' => 'Edit the activity',
			'app.dock.catalogue' => 'Catalogue',
			'app.dock.planning' => 'Planning',
			'app.dock.create' => 'Create',
			'app.dock.followUp' => 'Follow-up',
			'app.dock.pedagogy' => 'Pedagogy',
			'create.screens.tab' => 'Create',
			'dayTemplates.screens.template' => 'Day template',
			'dayTemplates.screens.edit' => 'Edit the day template',
			'dayTemplates.screens.visibility' => 'Templates',
			'events.screens.tab' => 'Planning',
			'events.screens.create' => 'New event',
			'events.screens.event' => 'Event',
			'events.screens.edit' => 'Edit the event',
			'events.screens.newBlock' => 'Set up the time',
			'events.screens.coordination' => 'Coordination',
			'followUp.screens.tab' => 'Follow-up',
			'inventory.screens.inventory' => 'Inventory',
			'notifications.screens.preferences' => 'Notifications',
			'notifications.screens.inbox' => 'My notifications',
			'pedagogy.screens.tab' => 'Pedagogy',
			'resources.screens.list' => 'Resources',
			'resources.screens.resource' => 'Resource',
			'reviews.screens.review' => 'Review',
			'reviews.screens.report' => 'Report',
			'sharing.screens.dossier' => 'Dossier contents',
			'sharing.screens.preview' => 'Dossier preview',
			'sharing.screens.link' => 'Share a link',
			'structures.screens.settings' => 'Settings',
			'structures.screens.structures' => 'Structures',
			'structures.screens.permissions' => 'Permissions',
			'tasks.screens.preparation' => 'Preparation',
			'tasks.screens.task' => 'My task',
			'threads.screens.list' => 'Guiding threads',
			'threads.screens.thread' => 'Guiding thread',
			'ui.actions.save' => 'Save',
			'ui.actions.cancel' => 'Cancel',
			'ui.actions.back' => 'Back',
			'ui.actions.close' => 'Close',
			'ui.actions.retry' => 'Try again',
			'ui.actions.apply' => 'Apply',
			'ui.actions.reset' => 'Reset',
			'ui.actions.results.saved' => 'Saved',
			'ui.comingSoon.title' => 'Coming soon',
			'ui.comingSoon.body' => 'This screen is not built yet.',
			'ui.comingSoon.wireframe' => ({required Object id}) => 'Wireframe ${id}',
			'ui.errors.generic' => 'Something went wrong.',
			'ui.search' => 'Search',
			'ui.range.any' => 'Any',
			'ui.range.from' => ({required Object min}) => '${min} and more',
			'ui.range.upTo' => ({required Object max}) => 'Up to ${max}',
			'ui.range.between' => ({required Object min, required Object max}) => 'From ${min} to ${max}',
			'ui.range.exactly' => ({required Object min}) => '${min}',
			'user.login.title' => 'Sign in',
			'user.login.email' => 'Email',
			'user.login.code' => 'Sign-in code',
			'user.login.sendCode' => 'Send me a code',
			'user.login.codeSentTo' => ({required Object email}) => 'A sign-in code was sent to ${email}. It is valid for 10 minutes.',
			'user.login.changeEmail' => 'Change email',
			'user.login.codeNotSent' => 'The code could not be sent.',
			'user.login.codeRejected' => 'Invalid or expired code.',
			'user.login.password' => 'Password',
			'user.login.withPassword' => 'Sign in with the password',
			'user.login.passwordRejected' => 'Wrong email or password.',
			'user.onboarding.title' => 'Welcome!',
			'user.onboarding.intro' => 'Pick the catalogue\'s default filters. You can change them at any time in your preferences.',
			'user.onboarding.later' => 'Later',
			'user.filterDefaults.title' => 'Default filters',
			'user.filterDefaults.help' => 'What the catalogue filters on first.',
			'user.filterDefaults.age' => 'Age (years)',
			'user.filterDefaults.participants' => 'Number of children',
			'user.filterDefaults.locations' => 'Places',
			'user.location.park' => 'Playground',
			'user.location.house' => 'House',
			'user.location.balcony' => 'Balcony',
			'user.location.car' => 'Car',
			'user.location.city' => 'City',
			'user.location.campaign' => 'Countryside',
			'user.location.forest' => 'Forest',
			'user.location.mountain' => 'Mountain',
			'user.location.pool' => 'Swimming pool',
			'user.location.lake' => 'Lake',
			'user.location.river' => 'River',
			'user.location.bath' => 'Bath',
			'user.location.meal' => 'Meal',
			'user.menu.title' => 'My space',
			'user.menu.contents' => 'My content',
			'user.menu.preferences' => 'My preferences',
			'user.menu.account' => 'My account',
			'user.menu.settings' => 'Settings',
			'user.menu.notifications' => 'Notifications',
			'user.menu.open' => 'Open my space',
			'user.preferences.title' => 'My preferences',
			'user.preferences.language' => 'Language',
			'user.preferences.theme' => 'Theme',
			'user.preferences.saved' => 'Preferences saved',
			'user.preferences.languages.device' => 'Device language',
			'user.preferences.languages.fr' => 'Français',
			'user.preferences.languages.en' => 'English',
			'user.preferences.themes.auto' => 'Automatic',
			'user.preferences.themes.light' => 'Light',
			'user.preferences.themes.dark' => 'Dark',
			'user.account.title' => 'My account',
			'user.account.name' => 'Name',
			'user.account.email' => 'Email address',
			'user.account.logout' => 'Sign out',
			'user.account.logoutConfirm' => 'Do you really want to sign out?',
			'user.contents.title' => 'My content',
			'validations.screens.event' => 'Validate the event',
			'validations.screens.adjust' => 'Ask for a change',
			_ => null,
		};
	}
}
