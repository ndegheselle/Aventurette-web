///
/// Generated file. Do not edit.
///
// coverage:ignore-file
// ignore_for_file: type=lint, unused_import
// dart format off

part of 'strings.g.dart';

// Path: <root>
typedef TranslationsFr = Translations; // ignore: unused_element
class Translations with BaseTranslations<AppLocale, Translations> {
	/// Returns the current translations of the given [context].
	///
	/// Usage:
	/// final t = Translations.of(context);
	static Translations of(BuildContext context) => InheritedLocaleData.of<AppLocale, Translations>(context).translations;

	/// You can call this constructor and build your own translation instance of this locale.
	/// Constructing via the enum [AppLocale.build] is preferred.
	Translations({Map<String, Node>? overrides, PluralResolver? cardinalResolver, PluralResolver? ordinalResolver, TranslationMetadata<AppLocale, Translations>? meta})
		: assert(overrides == null, 'Set "translation_overrides: true" in order to enable this feature.'),
		  _meta = meta ?? TranslationMetadata(
		    locale: AppLocale.fr,
		    overrides: overrides ?? {},
		    cardinalResolver: cardinalResolver,
		    ordinalResolver: ordinalResolver,
		  ) {
		_meta.setFlatMapFunction(_flatMapFunction);
	}

	/// Metadata for the translations of <fr>.
	final TranslationMetadata<AppLocale, Translations> _meta;
	@override TranslationMetadata<AppLocale, Translations> get $meta => _meta;

	/// Access flat map
	dynamic operator[](String key) => _meta.getTranslation(key);

	late final Translations _root = this; // ignore: unused_field

	Translations $copyWith({TranslationMetadata<AppLocale, Translations>? meta}) => Translations(meta: meta ?? this.$meta);

	// Translations
	late final Translations$activities$fr activities = Translations$activities$fr.internal(_root);
	late final Translations$activityEditor$fr activityEditor = Translations$activityEditor$fr.internal(_root);
	late final Translations$app$fr app = Translations$app$fr.internal(_root);
	late final Translations$create$fr create = Translations$create$fr.internal(_root);
	late final Translations$dayTemplates$fr dayTemplates = Translations$dayTemplates$fr.internal(_root);
	late final Translations$events$fr events = Translations$events$fr.internal(_root);
	late final Translations$followUp$fr followUp = Translations$followUp$fr.internal(_root);
	late final Translations$inventory$fr inventory = Translations$inventory$fr.internal(_root);
	late final Translations$notifications$fr notifications = Translations$notifications$fr.internal(_root);
	late final Translations$pedagogy$fr pedagogy = Translations$pedagogy$fr.internal(_root);
	late final Translations$resources$fr resources = Translations$resources$fr.internal(_root);
	late final Translations$reviews$fr reviews = Translations$reviews$fr.internal(_root);
	late final Translations$sharing$fr sharing = Translations$sharing$fr.internal(_root);
	late final Translations$structures$fr structures = Translations$structures$fr.internal(_root);
	late final Translations$tasks$fr tasks = Translations$tasks$fr.internal(_root);
	late final Translations$threads$fr threads = Translations$threads$fr.internal(_root);
	late final Translations$ui$fr ui = Translations$ui$fr.internal(_root);
	late final Translations$user$fr user = Translations$user$fr.internal(_root);
	late final Translations$validations$fr validations = Translations$validations$fr.internal(_root);
}

// Path: activities
class Translations$activities$fr {
	Translations$activities$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: '{minutes} min'
	String minutes({required Object minutes}) => '${minutes} min';

	late final Translations$activities$catalogue$fr catalogue = Translations$activities$catalogue$fr.internal(_root);
	late final Translations$activities$filters$fr filters = Translations$activities$filters$fr.internal(_root);
	late final Translations$activities$fields$fr fields = Translations$activities$fields$fr.internal(_root);
	Map<String, String> get format => {
		'smallGame': 'Petit jeu',
		'bigGame': 'Grand jeu',
		'workshop': 'Atelier',
	};
	Map<String, String> get practice => {
		'manualCreation': 'Création manuelle',
		'expression': 'Expression',
		'cooking': 'Cuisine',
		'observation': 'Observation',
		'music': 'Musique',
		'experimentation': 'Expérimentation',
	};
	Map<String, String> get imaginaryRule => {
		'none': 'Aucun imaginaire nécessaire',
		'adaptable': 'Habillage adaptable',
		'required': 'Imaginaire imposé',
	};
	Map<String, String> get childrenPace => {
		'calm': 'Calme',
		'dynamic': 'Dynamique',
	};
	Map<String, String> get hostEffort => {
		'low': 'Faible',
		'medium': 'Moyenne',
		'high': 'Importante',
	};
	Map<String, String> get season => {
		'autumn': 'Automne',
		'winter': 'Hiver',
		'spring': 'Printemps',
		'summer': 'Été',
	};
	Map<String, String> get stepKind => {
		'prepare': 'Préparer le jeu',
		'custom': 'Étape libre',
		'conclusion': 'Conclusion',
	};
	late final Translations$activities$sheet$fr sheet = Translations$activities$sheet$fr.internal(_root);
	late final Translations$activities$actions$fr actions = Translations$activities$actions$fr.internal(_root);
	late final Translations$activities$favorites$fr favorites = Translations$activities$favorites$fr.internal(_root);
	late final Translations$activities$run$fr run = Translations$activities$run$fr.internal(_root);
	late final Translations$activities$feedback$fr feedback = Translations$activities$feedback$fr.internal(_root);
	late final Translations$activities$preparation$fr preparation = Translations$activities$preparation$fr.internal(_root);
	late final Translations$activities$screens$fr screens = Translations$activities$screens$fr.internal(_root);
}

// Path: activityEditor
class Translations$activityEditor$fr {
	Translations$activityEditor$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$activityEditor$screens$fr screens = Translations$activityEditor$screens$fr.internal(_root);
}

// Path: app
class Translations$app$fr {
	Translations$app$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$app$dock$fr dock = Translations$app$dock$fr.internal(_root);
}

// Path: create
class Translations$create$fr {
	Translations$create$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$create$screens$fr screens = Translations$create$screens$fr.internal(_root);
}

// Path: dayTemplates
class Translations$dayTemplates$fr {
	Translations$dayTemplates$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$dayTemplates$screens$fr screens = Translations$dayTemplates$screens$fr.internal(_root);
}

// Path: events
class Translations$events$fr {
	Translations$events$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$events$screens$fr screens = Translations$events$screens$fr.internal(_root);
}

// Path: followUp
class Translations$followUp$fr {
	Translations$followUp$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$followUp$screens$fr screens = Translations$followUp$screens$fr.internal(_root);
}

// Path: inventory
class Translations$inventory$fr {
	Translations$inventory$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$inventory$screens$fr screens = Translations$inventory$screens$fr.internal(_root);
}

// Path: notifications
class Translations$notifications$fr {
	Translations$notifications$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$notifications$screens$fr screens = Translations$notifications$screens$fr.internal(_root);
}

// Path: pedagogy
class Translations$pedagogy$fr {
	Translations$pedagogy$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$pedagogy$screens$fr screens = Translations$pedagogy$screens$fr.internal(_root);
}

// Path: resources
class Translations$resources$fr {
	Translations$resources$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$resources$screens$fr screens = Translations$resources$screens$fr.internal(_root);
}

// Path: reviews
class Translations$reviews$fr {
	Translations$reviews$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$reviews$screens$fr screens = Translations$reviews$screens$fr.internal(_root);
}

// Path: sharing
class Translations$sharing$fr {
	Translations$sharing$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$sharing$screens$fr screens = Translations$sharing$screens$fr.internal(_root);
}

// Path: structures
class Translations$structures$fr {
	Translations$structures$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$structures$screens$fr screens = Translations$structures$screens$fr.internal(_root);
}

// Path: tasks
class Translations$tasks$fr {
	Translations$tasks$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$tasks$screens$fr screens = Translations$tasks$screens$fr.internal(_root);
}

// Path: threads
class Translations$threads$fr {
	Translations$threads$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$threads$screens$fr screens = Translations$threads$screens$fr.internal(_root);
}

// Path: ui
class Translations$ui$fr {
	Translations$ui$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$ui$actions$fr actions = Translations$ui$actions$fr.internal(_root);
	late final Translations$ui$comingSoon$fr comingSoon = Translations$ui$comingSoon$fr.internal(_root);
	late final Translations$ui$errors$fr errors = Translations$ui$errors$fr.internal(_root);

	/// fr: 'Rechercher'
	String get search => 'Rechercher';

	late final Translations$ui$range$fr range = Translations$ui$range$fr.internal(_root);
}

// Path: user
class Translations$user$fr {
	Translations$user$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$user$login$fr login = Translations$user$login$fr.internal(_root);
	late final Translations$user$onboarding$fr onboarding = Translations$user$onboarding$fr.internal(_root);
	late final Translations$user$filterDefaults$fr filterDefaults = Translations$user$filterDefaults$fr.internal(_root);
	Map<String, String> get location => {
		'park': 'Parc de jeux',
		'house': 'Maison',
		'balcony': 'Balcon',
		'car': 'Voiture',
		'city': 'Ville',
		'campaign': 'Campagne',
		'forest': 'Forêt',
		'mountain': 'Montagne',
		'pool': 'Piscine',
		'lake': 'Lac',
		'river': 'Rivière',
		'bath': 'Bain',
		'meal': 'Repas',
	};
	late final Translations$user$menu$fr menu = Translations$user$menu$fr.internal(_root);
	late final Translations$user$preferences$fr preferences = Translations$user$preferences$fr.internal(_root);
	late final Translations$user$account$fr account = Translations$user$account$fr.internal(_root);
	late final Translations$user$contents$fr contents = Translations$user$contents$fr.internal(_root);
}

// Path: validations
class Translations$validations$fr {
	Translations$validations$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations
	late final Translations$validations$screens$fr screens = Translations$validations$screens$fr.internal(_root);
}

// Path: activities.catalogue
class Translations$activities$catalogue$fr {
	Translations$activities$catalogue$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Catalogue'
	String get title => 'Catalogue';

	/// fr: 'Un jeu, une idée, un objectif…'
	String get searchHint => 'Un jeu, une idée, un objectif…';

	/// fr: 'Aucune activité ne correspond à votre recherche. Essayez d'élargir vos filtres.'
	String get empty => 'Aucune activité ne correspond à votre recherche. Essayez d\'élargir vos filtres.';

	/// fr: 'Aucune activité enregistrée pour l'instant. Touchez le cœur d'une activité pour la retrouver ici.'
	String get favoritesEmpty => 'Aucune activité enregistrée pour l\'instant. Touchez le cœur d\'une activité pour la retrouver ici.';

	Map<String, String> get segments => {
		'all': 'Toutes',
		'favorites': 'Favoris',
		'mine': 'Mes créations',
		'shared': 'Partagés avec moi',
	};
}

// Path: activities.filters
class Translations$activities$filters$fr {
	Translations$activities$filters$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Filtres'
	String get title => 'Filtres';

	/// fr: 'Filtrer les activités'
	String get open => 'Filtrer les activités';

	/// fr: 'Tous'
	String get any => 'Tous';

	/// fr: '{count} lieux'
	String locations({required Object count}) => '${count} lieux';

	late final Translations$activities$filters$age$fr age = Translations$activities$filters$age$fr.internal(_root);
	late final Translations$activities$filters$participants$fr participants = Translations$activities$filters$participants$fr.internal(_root);
	late final Translations$activities$filters$profile$fr profile = Translations$activities$filters$profile$fr.internal(_root);
	Map<String, String> get quick => {
		'age': 'Âge',
		'participants': 'Enfants',
		'location': 'Lieu',
	};
}

// Path: activities.fields
class Translations$activities$fields$fr {
	Translations$activities$fields$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Format'
	String get format => 'Format';

	/// fr: 'Pratique (atelier)'
	String get practices => 'Pratique (atelier)';

	/// fr: 'Règle d'imaginaire'
	String get imaginaryRule => 'Règle d\'imaginaire';

	/// fr: 'Âge'
	String get age => 'Âge';

	/// fr: 'Effectif recommandé'
	String get participants => 'Effectif recommandé';

	/// fr: 'Rythme des enfants'
	String get childrenPace => 'Rythme des enfants';

	/// fr: 'Mobilisation de l'animateur'
	String get hostEffort => 'Mobilisation de l\'animateur';

	/// fr: 'Nombre d'animateurs requis'
	String get hosts => 'Nombre d\'animateurs requis';

	/// fr: 'Surveillance transversale des ateliers'
	String get crossSupervision => 'Surveillance transversale des ateliers';

	/// fr: 'Lieu'
	String get place => 'Lieu';

	/// fr: 'Intérieur'
	String get indoor => 'Intérieur';

	/// fr: 'Extérieur'
	String get outdoor => 'Extérieur';

	/// fr: 'Localisation détaillée'
	String get locations => 'Localisation détaillée';

	/// fr: 'Saisons'
	String get seasons => 'Saisons';

	/// fr: 'Consignes de sécurité'
	String get safetyInstructions => 'Consignes de sécurité';

	/// fr: 'Temps de préparation'
	String get preparationTime => 'Temps de préparation';

	/// fr: 'Temps de jeu'
	String get playTime => 'Temps de jeu';

	/// fr: 'Durée totale'
	String get totalTime => 'Durée totale';

	/// fr: 'Thème'
	String get themes => 'Thème';

	/// fr: 'Imaginaire'
	String get universes => 'Imaginaire';

	/// fr: 'Tags pédagogiques'
	String get goals => 'Tags pédagogiques';

	/// fr: 'Idéal pour…'
	String get idealFor => 'Idéal pour…';

	/// fr: 'Oui'
	String get yes => 'Oui';
}

// Path: activities.sheet
class Translations$activities$sheet$fr {
	Translations$activities$sheet$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: '{count} joueurs'
	String participants({required Object count}) => '${count} joueurs';

	/// fr: '{min}–{max} joueurs'
	String participantsRange({required Object min, required Object max}) => '${min}–${max} joueurs';

	/// fr: '{count} animateur(s)'
	String hosts({required Object count}) => '${count} animateur(s)';

	/// fr: 'Préparation et matériel'
	String get preparation => 'Préparation et matériel';

	/// fr: 'Matériel, installation et ressources'
	String get preparationHint => 'Matériel, installation et ressources';

	/// fr: 'Caractéristiques'
	String get details => 'Caractéristiques';

	/// fr: 'Voir plus'
	String get more => 'Voir plus';

	/// fr: 'Voir moins'
	String get less => 'Voir moins';

	/// fr: 'Déroulé'
	String get steps => 'Déroulé';

	/// fr: 'Matériel et ressources'
	String get supplies => 'Matériel et ressources';

	/// fr: 'Ateliers'
	String get workshops => 'Ateliers';

	/// fr: '{count} adulte(s)'
	String adults({required Object count}) => '${count} adulte(s)';

	/// fr: 'Quantité'
	String get quantity => 'Quantité';

	/// fr: 'Ouvrir la ressource'
	String get openResource => 'Ouvrir la ressource';
}

// Path: activities.actions
class Translations$activities$actions$fr {
	Translations$activities$actions$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Partager'
	String get share => 'Partager';

	/// fr: 'Modifier'
	String get edit => 'Modifier';

	/// fr: 'Enregistrer'
	String get save => 'Enregistrer';

	/// fr: 'Enregistrée'
	String get saved => 'Enregistrée';

	/// fr: 'Mode guidé'
	String get guided => 'Mode guidé';

	/// fr: 'Mode rapide'
	String get quickMode => 'Mode rapide';
}

// Path: activities.favorites
class Translations$activities$favorites$fr {
	Translations$activities$favorites$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Activité enregistrée'
	String get added => 'Activité enregistrée';

	/// fr: 'Activité retirée des favoris'
	String get removed => 'Activité retirée des favoris';

	/// fr: 'Annuler'
	String get undo => 'Annuler';
}

// Path: activities.run
class Translations$activities$run$fr {
	Translations$activities$run$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Étape {current} / {total}'
	String step({required Object current, required Object total}) => 'Étape ${current} / ${total}';

	/// fr: 'Précédent'
	String get previous => 'Précédent';

	/// fr: 'Suivant'
	String get next => 'Suivant';

	/// fr: 'Terminer'
	String get finish => 'Terminer';

	/// fr: 'Cette activité n'a pas encore d'étape.'
	String get empty => 'Cette activité n\'a pas encore d\'étape.';

	/// fr: 'Consignes'
	String get instructions => 'Consignes';

	/// fr: 'Conseils'
	String get tips => 'Conseils';

	/// fr: 'Matériel de l'étape'
	String get supplies => 'Matériel de l\'étape';
}

// Path: activities.feedback
class Translations$activities$feedback$fr {
	Translations$activities$feedback$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Bravo !'
	String get bravo => 'Bravo !';

	/// fr: 'Vous avez terminé « {name} ».'
	String finished({required Object name}) => 'Vous avez terminé « ${name} ».';

	/// fr: 'J'aime cette activité'
	String get like => 'J\'aime cette activité';

	/// fr: 'Un commentaire ?'
	String get comment => 'Un commentaire ?';

	/// fr: 'Ce qui a plu, ce qui a coincé…'
	String get commentPlaceholder => 'Ce qui a plu, ce qui a coincé…';

	/// fr: 'Quitter'
	String get leave => 'Quitter';

	/// fr: 'Votre avis n'a pas pu être enregistré.'
	String get saveRefused => 'Votre avis n\'a pas pu être enregistré.';
}

// Path: activities.preparation
class Translations$activities$preparation$fr {
	Translations$activities$preparation$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Préparation'
	String get title => 'Préparation';

	Map<String, String> get tabs => {
		'materials': 'Matériel',
		'setup': 'Installation',
		'advice': 'Conseils',
	};

	/// fr: 'Atelier · {name}'
	String workshop({required Object name}) => 'Atelier · ${name}';

	/// fr: 'Ressources'
	String get resources => 'Ressources';

	/// fr: 'Installation · {minutes} min'
	String setupTotal({required Object minutes}) => 'Installation · ${minutes} min';

	/// fr: 'Sécurité'
	String get safety => 'Sécurité';

	/// fr: 'Conseils'
	String get tips => 'Conseils';

	/// fr: 'Cette activité ne demande pas de matériel.'
	String get noMaterials => 'Cette activité ne demande pas de matériel.';

	/// fr: 'Rien à installer avant le jeu.'
	String get noSetup => 'Rien à installer avant le jeu.';

	/// fr: 'Pas de conseil particulier pour cette activité.'
	String get noAdvice => 'Pas de conseil particulier pour cette activité.';

	/// fr: 'Ces préparatifs alimentent les tâches de l'événement, attribuées depuis Planning.'
	String get hint => 'Ces préparatifs alimentent les tâches de l\'événement, attribuées depuis Planning.';

	/// fr: 'Retour à la fiche'
	String get back => 'Retour à la fiche';
}

// Path: activities.screens
class Translations$activities$screens$fr {
	Translations$activities$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Mode rapide'
	String get quick => 'Mode rapide';
}

// Path: activityEditor.screens
class Translations$activityEditor$screens$fr {
	Translations$activityEditor$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Créer une activité'
	String get create => 'Créer une activité';

	/// fr: 'Modifier l'activité'
	String get edit => 'Modifier l\'activité';
}

// Path: app.dock
class Translations$app$dock$fr {
	Translations$app$dock$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Catalogue'
	String get catalogue => 'Catalogue';

	/// fr: 'Planning'
	String get planning => 'Planning';

	/// fr: 'Créer'
	String get create => 'Créer';

	/// fr: 'Suivi'
	String get followUp => 'Suivi';

	/// fr: 'Pédagogie'
	String get pedagogy => 'Pédagogie';
}

// Path: create.screens
class Translations$create$screens$fr {
	Translations$create$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Créer'
	String get tab => 'Créer';
}

// Path: dayTemplates.screens
class Translations$dayTemplates$screens$fr {
	Translations$dayTemplates$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Journée type'
	String get template => 'Journée type';

	/// fr: 'Modifier la journée type'
	String get edit => 'Modifier la journée type';

	/// fr: 'Modèles'
	String get visibility => 'Modèles';
}

// Path: events.screens
class Translations$events$screens$fr {
	Translations$events$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Planning'
	String get tab => 'Planning';

	/// fr: 'Créer un événement'
	String get create => 'Créer un événement';

	/// fr: 'Événement'
	String get event => 'Événement';

	/// fr: 'Modifier l'événement'
	String get edit => 'Modifier l\'événement';

	/// fr: 'Paramétrer le temps'
	String get newBlock => 'Paramétrer le temps';

	/// fr: 'Coordination'
	String get coordination => 'Coordination';
}

// Path: followUp.screens
class Translations$followUp$screens$fr {
	Translations$followUp$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Suivi'
	String get tab => 'Suivi';
}

// Path: inventory.screens
class Translations$inventory$screens$fr {
	Translations$inventory$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Inventaire'
	String get inventory => 'Inventaire';
}

// Path: notifications.screens
class Translations$notifications$screens$fr {
	Translations$notifications$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Notifications'
	String get preferences => 'Notifications';

	/// fr: 'Mes notifications'
	String get inbox => 'Mes notifications';
}

// Path: pedagogy.screens
class Translations$pedagogy$screens$fr {
	Translations$pedagogy$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Pédagogie'
	String get tab => 'Pédagogie';
}

// Path: resources.screens
class Translations$resources$screens$fr {
	Translations$resources$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Ressources'
	String get list => 'Ressources';

	/// fr: 'Ressource'
	String get resource => 'Ressource';
}

// Path: reviews.screens
class Translations$reviews$screens$fr {
	Translations$reviews$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Bilan pédagogique'
	String get review => 'Bilan pédagogique';

	/// fr: 'Rapport pédagogique'
	String get report => 'Rapport pédagogique';
}

// Path: sharing.screens
class Translations$sharing$screens$fr {
	Translations$sharing$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Contenu du dossier'
	String get dossier => 'Contenu du dossier';

	/// fr: 'Aperçu du dossier'
	String get preview => 'Aperçu du dossier';

	/// fr: 'Partager un lien'
	String get link => 'Partager un lien';
}

// Path: structures.screens
class Translations$structures$screens$fr {
	Translations$structures$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Paramètres'
	String get settings => 'Paramètres';

	/// fr: 'Structures'
	String get structures => 'Structures';

	/// fr: 'Autorisations'
	String get permissions => 'Autorisations';
}

// Path: tasks.screens
class Translations$tasks$screens$fr {
	Translations$tasks$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Préparation'
	String get preparation => 'Préparation';

	/// fr: 'Ma tâche'
	String get task => 'Ma tâche';
}

// Path: threads.screens
class Translations$threads$screens$fr {
	Translations$threads$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Fils conducteurs'
	String get list => 'Fils conducteurs';

	/// fr: 'Fil conducteur'
	String get thread => 'Fil conducteur';
}

// Path: ui.actions
class Translations$ui$actions$fr {
	Translations$ui$actions$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Enregistrer'
	String get save => 'Enregistrer';

	/// fr: 'Annuler'
	String get cancel => 'Annuler';

	/// fr: 'Retour'
	String get back => 'Retour';

	/// fr: 'Fermer'
	String get close => 'Fermer';

	/// fr: 'Réessayer'
	String get retry => 'Réessayer';

	/// fr: 'Appliquer'
	String get apply => 'Appliquer';

	/// fr: 'Réinitialiser'
	String get reset => 'Réinitialiser';

	late final Translations$ui$actions$results$fr results = Translations$ui$actions$results$fr.internal(_root);
}

// Path: ui.comingSoon
class Translations$ui$comingSoon$fr {
	Translations$ui$comingSoon$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Bientôt disponible'
	String get title => 'Bientôt disponible';

	/// fr: 'Cet écran n'est pas encore construit.'
	String get body => 'Cet écran n\'est pas encore construit.';

	/// fr: 'Maquette {id}'
	String wireframe({required Object id}) => 'Maquette ${id}';
}

// Path: ui.errors
class Translations$ui$errors$fr {
	Translations$ui$errors$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Une erreur est survenue.'
	String get generic => 'Une erreur est survenue.';
}

// Path: ui.range
class Translations$ui$range$fr {
	Translations$ui$range$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Tous'
	String get any => 'Tous';

	/// fr: '{min} et plus'
	String from({required Object min}) => '${min} et plus';

	/// fr: 'Jusqu'à {max}'
	String upTo({required Object max}) => 'Jusqu\'à ${max}';

	/// fr: 'De {min} à {max}'
	String between({required Object min, required Object max}) => 'De ${min} à ${max}';

	/// fr: '{min}'
	String exactly({required Object min}) => '${min}';
}

// Path: user.login
class Translations$user$login$fr {
	Translations$user$login$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Se connecter'
	String get title => 'Se connecter';

	/// fr: 'E-mail'
	String get email => 'E-mail';

	/// fr: 'Code de connexion'
	String get code => 'Code de connexion';

	/// fr: 'Recevoir un code'
	String get sendCode => 'Recevoir un code';

	/// fr: 'Un code de connexion a été envoyé à {email}. Il est valable 10 minutes.'
	String codeSentTo({required Object email}) => 'Un code de connexion a été envoyé à ${email}. Il est valable 10 minutes.';

	/// fr: 'Changer d'e-mail'
	String get changeEmail => 'Changer d\'e-mail';

	/// fr: 'Le code n'a pas pu être envoyé.'
	String get codeNotSent => 'Le code n\'a pas pu être envoyé.';

	/// fr: 'Code invalide ou expiré.'
	String get codeRejected => 'Code invalide ou expiré.';

	/// fr: 'Mot de passe'
	String get password => 'Mot de passe';

	/// fr: 'Se connecter avec le mot de passe'
	String get withPassword => 'Se connecter avec le mot de passe';

	/// fr: 'E-mail ou mot de passe incorrect.'
	String get passwordRejected => 'E-mail ou mot de passe incorrect.';
}

// Path: user.onboarding
class Translations$user$onboarding$fr {
	Translations$user$onboarding$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Bienvenue !'
	String get title => 'Bienvenue !';

	/// fr: 'Choisissez les filtres par défaut du catalogue. Vous pourrez les changer à tout moment dans vos préférences.'
	String get intro => 'Choisissez les filtres par défaut du catalogue. Vous pourrez les changer à tout moment dans vos préférences.';

	/// fr: 'Plus tard'
	String get later => 'Plus tard';
}

// Path: user.filterDefaults
class Translations$user$filterDefaults$fr {
	Translations$user$filterDefaults$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Filtres par défaut'
	String get title => 'Filtres par défaut';

	/// fr: 'Ce que le catalogue filtre en premier.'
	String get help => 'Ce que le catalogue filtre en premier.';

	/// fr: 'Âge (ans)'
	String get age => 'Âge (ans)';

	/// fr: 'Nombre d'enfants'
	String get participants => 'Nombre d\'enfants';

	/// fr: 'Lieux'
	String get locations => 'Lieux';
}

// Path: user.menu
class Translations$user$menu$fr {
	Translations$user$menu$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Mon espace'
	String get title => 'Mon espace';

	/// fr: 'Mes contenus'
	String get contents => 'Mes contenus';

	/// fr: 'Mes préférences'
	String get preferences => 'Mes préférences';

	/// fr: 'Mon compte'
	String get account => 'Mon compte';

	/// fr: 'Paramètres'
	String get settings => 'Paramètres';

	/// fr: 'Notifications'
	String get notifications => 'Notifications';

	/// fr: 'Ouvrir mon espace'
	String get open => 'Ouvrir mon espace';
}

// Path: user.preferences
class Translations$user$preferences$fr {
	Translations$user$preferences$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Mes préférences'
	String get title => 'Mes préférences';

	/// fr: 'Langue'
	String get language => 'Langue';

	/// fr: 'Thème'
	String get theme => 'Thème';

	/// fr: 'Préférences enregistrées'
	String get saved => 'Préférences enregistrées';

	Map<String, String> get languages => {
		'device': 'Langue de l\'appareil',
		'fr': 'Français',
		'en': 'English',
	};
	Map<String, String> get themes => {
		'auto': 'Automatique',
		'light': 'Clair',
		'dark': 'Sombre',
	};
}

// Path: user.account
class Translations$user$account$fr {
	Translations$user$account$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Mon compte'
	String get title => 'Mon compte';

	/// fr: 'Nom'
	String get name => 'Nom';

	/// fr: 'Adresse e-mail'
	String get email => 'Adresse e-mail';

	/// fr: 'Se déconnecter'
	String get logout => 'Se déconnecter';

	/// fr: 'Voulez-vous vraiment vous déconnecter ?'
	String get logoutConfirm => 'Voulez-vous vraiment vous déconnecter ?';
}

// Path: user.contents
class Translations$user$contents$fr {
	Translations$user$contents$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Mes contenus'
	String get title => 'Mes contenus';
}

// Path: validations.screens
class Translations$validations$screens$fr {
	Translations$validations$screens$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Valider l'événement'
	String get event => 'Valider l\'événement';

	/// fr: 'Demander un ajustement'
	String get adjust => 'Demander un ajustement';
}

// Path: activities.filters.age
class Translations$activities$filters$age$fr {
	Translations$activities$filters$age$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: '{min} ans et +'
	String from({required Object min}) => '${min} ans et +';

	/// fr: 'Jusqu'à {max} ans'
	String upTo({required Object max}) => 'Jusqu\'à ${max} ans';

	/// fr: '{min}–{max} ans'
	String between({required Object min, required Object max}) => '${min}–${max} ans';

	/// fr: '{min} ans'
	String exactly({required Object min}) => '${min} ans';
}

// Path: activities.filters.participants
class Translations$activities$filters$participants$fr {
	Translations$activities$filters$participants$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: '{min} enfants et +'
	String from({required Object min}) => '${min} enfants et +';

	/// fr: 'Jusqu'à {max} enfants'
	String upTo({required Object max}) => 'Jusqu\'à ${max} enfants';

	/// fr: '{min}–{max} enfants'
	String between({required Object min, required Object max}) => '${min}–${max} enfants';

	/// fr: '{min} enfants'
	String exactly({required Object min}) => '${min} enfants';
}

// Path: activities.filters.profile
class Translations$activities$filters$profile$fr {
	Translations$activities$filters$profile$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Appliquer mon profil'
	String get title => 'Appliquer mon profil';

	/// fr: 'L'âge, le nombre d'enfants et les lieux de vos préférences.'
	String get help => 'L\'âge, le nombre d\'enfants et les lieux de vos préférences.';

	/// fr: 'Vos préférences n'ont pas encore de filtres par défaut.'
	String get empty => 'Vos préférences n\'ont pas encore de filtres par défaut.';
}

// Path: ui.actions.results
class Translations$ui$actions$results$fr {
	Translations$ui$actions$results$fr.internal(this._root);

	final Translations _root; // ignore: unused_field

	// Translations

	/// fr: 'Enregistré'
	String get saved => 'Enregistré';
}

/// The flat map containing all translations for locale <fr>.
/// Only for edge cases! For simple maps, use the map function of this library.
///
/// The Dart AOT compiler has issues with very large switch statements,
/// so the map is split into smaller functions (512 entries each).
extension on Translations {
	dynamic _flatMapFunction(String path) {
		return switch (path) {
			'activities.minutes' => ({required Object minutes}) => '${minutes} min',
			'activities.catalogue.title' => 'Catalogue',
			'activities.catalogue.searchHint' => 'Un jeu, une idée, un objectif…',
			'activities.catalogue.empty' => 'Aucune activité ne correspond à votre recherche. Essayez d\'élargir vos filtres.',
			'activities.catalogue.favoritesEmpty' => 'Aucune activité enregistrée pour l\'instant. Touchez le cœur d\'une activité pour la retrouver ici.',
			'activities.catalogue.segments.all' => 'Toutes',
			'activities.catalogue.segments.favorites' => 'Favoris',
			'activities.catalogue.segments.mine' => 'Mes créations',
			'activities.catalogue.segments.shared' => 'Partagés avec moi',
			'activities.filters.title' => 'Filtres',
			'activities.filters.open' => 'Filtrer les activités',
			'activities.filters.any' => 'Tous',
			'activities.filters.locations' => ({required Object count}) => '${count} lieux',
			'activities.filters.age.from' => ({required Object min}) => '${min} ans et +',
			'activities.filters.age.upTo' => ({required Object max}) => 'Jusqu\'à ${max} ans',
			'activities.filters.age.between' => ({required Object min, required Object max}) => '${min}–${max} ans',
			'activities.filters.age.exactly' => ({required Object min}) => '${min} ans',
			'activities.filters.participants.from' => ({required Object min}) => '${min} enfants et +',
			'activities.filters.participants.upTo' => ({required Object max}) => 'Jusqu\'à ${max} enfants',
			'activities.filters.participants.between' => ({required Object min, required Object max}) => '${min}–${max} enfants',
			'activities.filters.participants.exactly' => ({required Object min}) => '${min} enfants',
			'activities.filters.profile.title' => 'Appliquer mon profil',
			'activities.filters.profile.help' => 'L\'âge, le nombre d\'enfants et les lieux de vos préférences.',
			'activities.filters.profile.empty' => 'Vos préférences n\'ont pas encore de filtres par défaut.',
			'activities.filters.quick.age' => 'Âge',
			'activities.filters.quick.participants' => 'Enfants',
			'activities.filters.quick.location' => 'Lieu',
			'activities.fields.format' => 'Format',
			'activities.fields.practices' => 'Pratique (atelier)',
			'activities.fields.imaginaryRule' => 'Règle d\'imaginaire',
			'activities.fields.age' => 'Âge',
			'activities.fields.participants' => 'Effectif recommandé',
			'activities.fields.childrenPace' => 'Rythme des enfants',
			'activities.fields.hostEffort' => 'Mobilisation de l\'animateur',
			'activities.fields.hosts' => 'Nombre d\'animateurs requis',
			'activities.fields.crossSupervision' => 'Surveillance transversale des ateliers',
			'activities.fields.place' => 'Lieu',
			'activities.fields.indoor' => 'Intérieur',
			'activities.fields.outdoor' => 'Extérieur',
			'activities.fields.locations' => 'Localisation détaillée',
			'activities.fields.seasons' => 'Saisons',
			'activities.fields.safetyInstructions' => 'Consignes de sécurité',
			'activities.fields.preparationTime' => 'Temps de préparation',
			'activities.fields.playTime' => 'Temps de jeu',
			'activities.fields.totalTime' => 'Durée totale',
			'activities.fields.themes' => 'Thème',
			'activities.fields.universes' => 'Imaginaire',
			'activities.fields.goals' => 'Tags pédagogiques',
			'activities.fields.idealFor' => 'Idéal pour…',
			'activities.fields.yes' => 'Oui',
			'activities.format.smallGame' => 'Petit jeu',
			'activities.format.bigGame' => 'Grand jeu',
			'activities.format.workshop' => 'Atelier',
			'activities.practice.manualCreation' => 'Création manuelle',
			'activities.practice.expression' => 'Expression',
			'activities.practice.cooking' => 'Cuisine',
			'activities.practice.observation' => 'Observation',
			'activities.practice.music' => 'Musique',
			'activities.practice.experimentation' => 'Expérimentation',
			'activities.imaginaryRule.none' => 'Aucun imaginaire nécessaire',
			'activities.imaginaryRule.adaptable' => 'Habillage adaptable',
			'activities.imaginaryRule.required' => 'Imaginaire imposé',
			'activities.childrenPace.calm' => 'Calme',
			'activities.childrenPace.dynamic' => 'Dynamique',
			'activities.hostEffort.low' => 'Faible',
			'activities.hostEffort.medium' => 'Moyenne',
			'activities.hostEffort.high' => 'Importante',
			'activities.season.autumn' => 'Automne',
			'activities.season.winter' => 'Hiver',
			'activities.season.spring' => 'Printemps',
			'activities.season.summer' => 'Été',
			'activities.stepKind.prepare' => 'Préparer le jeu',
			'activities.stepKind.custom' => 'Étape libre',
			'activities.stepKind.conclusion' => 'Conclusion',
			'activities.sheet.participants' => ({required Object count}) => '${count} joueurs',
			'activities.sheet.participantsRange' => ({required Object min, required Object max}) => '${min}–${max} joueurs',
			'activities.sheet.hosts' => ({required Object count}) => '${count} animateur(s)',
			'activities.sheet.preparation' => 'Préparation et matériel',
			'activities.sheet.preparationHint' => 'Matériel, installation et ressources',
			'activities.sheet.details' => 'Caractéristiques',
			'activities.sheet.more' => 'Voir plus',
			'activities.sheet.less' => 'Voir moins',
			'activities.sheet.steps' => 'Déroulé',
			'activities.sheet.supplies' => 'Matériel et ressources',
			'activities.sheet.workshops' => 'Ateliers',
			'activities.sheet.adults' => ({required Object count}) => '${count} adulte(s)',
			'activities.sheet.quantity' => 'Quantité',
			'activities.sheet.openResource' => 'Ouvrir la ressource',
			'activities.actions.share' => 'Partager',
			'activities.actions.edit' => 'Modifier',
			'activities.actions.save' => 'Enregistrer',
			'activities.actions.saved' => 'Enregistrée',
			'activities.actions.guided' => 'Mode guidé',
			'activities.actions.quickMode' => 'Mode rapide',
			'activities.favorites.added' => 'Activité enregistrée',
			'activities.favorites.removed' => 'Activité retirée des favoris',
			'activities.favorites.undo' => 'Annuler',
			'activities.run.step' => ({required Object current, required Object total}) => 'Étape ${current} / ${total}',
			'activities.run.previous' => 'Précédent',
			'activities.run.next' => 'Suivant',
			'activities.run.finish' => 'Terminer',
			'activities.run.empty' => 'Cette activité n\'a pas encore d\'étape.',
			'activities.run.instructions' => 'Consignes',
			'activities.run.tips' => 'Conseils',
			'activities.run.supplies' => 'Matériel de l\'étape',
			'activities.feedback.bravo' => 'Bravo !',
			'activities.feedback.finished' => ({required Object name}) => 'Vous avez terminé « ${name} ».',
			'activities.feedback.like' => 'J\'aime cette activité',
			'activities.feedback.comment' => 'Un commentaire ?',
			'activities.feedback.commentPlaceholder' => 'Ce qui a plu, ce qui a coincé…',
			'activities.feedback.leave' => 'Quitter',
			'activities.feedback.saveRefused' => 'Votre avis n\'a pas pu être enregistré.',
			'activities.preparation.title' => 'Préparation',
			'activities.preparation.tabs.materials' => 'Matériel',
			'activities.preparation.tabs.setup' => 'Installation',
			'activities.preparation.tabs.advice' => 'Conseils',
			'activities.preparation.workshop' => ({required Object name}) => 'Atelier · ${name}',
			'activities.preparation.resources' => 'Ressources',
			'activities.preparation.setupTotal' => ({required Object minutes}) => 'Installation · ${minutes} min',
			'activities.preparation.safety' => 'Sécurité',
			'activities.preparation.tips' => 'Conseils',
			'activities.preparation.noMaterials' => 'Cette activité ne demande pas de matériel.',
			'activities.preparation.noSetup' => 'Rien à installer avant le jeu.',
			'activities.preparation.noAdvice' => 'Pas de conseil particulier pour cette activité.',
			'activities.preparation.hint' => 'Ces préparatifs alimentent les tâches de l\'événement, attribuées depuis Planning.',
			'activities.preparation.back' => 'Retour à la fiche',
			'activities.screens.quick' => 'Mode rapide',
			'activityEditor.screens.create' => 'Créer une activité',
			'activityEditor.screens.edit' => 'Modifier l\'activité',
			'app.dock.catalogue' => 'Catalogue',
			'app.dock.planning' => 'Planning',
			'app.dock.create' => 'Créer',
			'app.dock.followUp' => 'Suivi',
			'app.dock.pedagogy' => 'Pédagogie',
			'create.screens.tab' => 'Créer',
			'dayTemplates.screens.template' => 'Journée type',
			'dayTemplates.screens.edit' => 'Modifier la journée type',
			'dayTemplates.screens.visibility' => 'Modèles',
			'events.screens.tab' => 'Planning',
			'events.screens.create' => 'Créer un événement',
			'events.screens.event' => 'Événement',
			'events.screens.edit' => 'Modifier l\'événement',
			'events.screens.newBlock' => 'Paramétrer le temps',
			'events.screens.coordination' => 'Coordination',
			'followUp.screens.tab' => 'Suivi',
			'inventory.screens.inventory' => 'Inventaire',
			'notifications.screens.preferences' => 'Notifications',
			'notifications.screens.inbox' => 'Mes notifications',
			'pedagogy.screens.tab' => 'Pédagogie',
			'resources.screens.list' => 'Ressources',
			'resources.screens.resource' => 'Ressource',
			'reviews.screens.review' => 'Bilan pédagogique',
			'reviews.screens.report' => 'Rapport pédagogique',
			'sharing.screens.dossier' => 'Contenu du dossier',
			'sharing.screens.preview' => 'Aperçu du dossier',
			'sharing.screens.link' => 'Partager un lien',
			'structures.screens.settings' => 'Paramètres',
			'structures.screens.structures' => 'Structures',
			'structures.screens.permissions' => 'Autorisations',
			'tasks.screens.preparation' => 'Préparation',
			'tasks.screens.task' => 'Ma tâche',
			'threads.screens.list' => 'Fils conducteurs',
			'threads.screens.thread' => 'Fil conducteur',
			'ui.actions.save' => 'Enregistrer',
			'ui.actions.cancel' => 'Annuler',
			'ui.actions.back' => 'Retour',
			'ui.actions.close' => 'Fermer',
			'ui.actions.retry' => 'Réessayer',
			'ui.actions.apply' => 'Appliquer',
			'ui.actions.reset' => 'Réinitialiser',
			'ui.actions.results.saved' => 'Enregistré',
			'ui.comingSoon.title' => 'Bientôt disponible',
			'ui.comingSoon.body' => 'Cet écran n\'est pas encore construit.',
			'ui.comingSoon.wireframe' => ({required Object id}) => 'Maquette ${id}',
			'ui.errors.generic' => 'Une erreur est survenue.',
			'ui.search' => 'Rechercher',
			'ui.range.any' => 'Tous',
			'ui.range.from' => ({required Object min}) => '${min} et plus',
			'ui.range.upTo' => ({required Object max}) => 'Jusqu\'à ${max}',
			'ui.range.between' => ({required Object min, required Object max}) => 'De ${min} à ${max}',
			'ui.range.exactly' => ({required Object min}) => '${min}',
			'user.login.title' => 'Se connecter',
			'user.login.email' => 'E-mail',
			'user.login.code' => 'Code de connexion',
			'user.login.sendCode' => 'Recevoir un code',
			'user.login.codeSentTo' => ({required Object email}) => 'Un code de connexion a été envoyé à ${email}. Il est valable 10 minutes.',
			'user.login.changeEmail' => 'Changer d\'e-mail',
			'user.login.codeNotSent' => 'Le code n\'a pas pu être envoyé.',
			'user.login.codeRejected' => 'Code invalide ou expiré.',
			'user.login.password' => 'Mot de passe',
			'user.login.withPassword' => 'Se connecter avec le mot de passe',
			'user.login.passwordRejected' => 'E-mail ou mot de passe incorrect.',
			'user.onboarding.title' => 'Bienvenue !',
			'user.onboarding.intro' => 'Choisissez les filtres par défaut du catalogue. Vous pourrez les changer à tout moment dans vos préférences.',
			'user.onboarding.later' => 'Plus tard',
			'user.filterDefaults.title' => 'Filtres par défaut',
			'user.filterDefaults.help' => 'Ce que le catalogue filtre en premier.',
			'user.filterDefaults.age' => 'Âge (ans)',
			'user.filterDefaults.participants' => 'Nombre d\'enfants',
			'user.filterDefaults.locations' => 'Lieux',
			'user.location.park' => 'Parc de jeux',
			'user.location.house' => 'Maison',
			'user.location.balcony' => 'Balcon',
			'user.location.car' => 'Voiture',
			'user.location.city' => 'Ville',
			'user.location.campaign' => 'Campagne',
			'user.location.forest' => 'Forêt',
			'user.location.mountain' => 'Montagne',
			'user.location.pool' => 'Piscine',
			'user.location.lake' => 'Lac',
			'user.location.river' => 'Rivière',
			'user.location.bath' => 'Bain',
			'user.location.meal' => 'Repas',
			'user.menu.title' => 'Mon espace',
			'user.menu.contents' => 'Mes contenus',
			'user.menu.preferences' => 'Mes préférences',
			'user.menu.account' => 'Mon compte',
			'user.menu.settings' => 'Paramètres',
			'user.menu.notifications' => 'Notifications',
			'user.menu.open' => 'Ouvrir mon espace',
			'user.preferences.title' => 'Mes préférences',
			'user.preferences.language' => 'Langue',
			'user.preferences.theme' => 'Thème',
			'user.preferences.saved' => 'Préférences enregistrées',
			'user.preferences.languages.device' => 'Langue de l\'appareil',
			'user.preferences.languages.fr' => 'Français',
			'user.preferences.languages.en' => 'English',
			'user.preferences.themes.auto' => 'Automatique',
			'user.preferences.themes.light' => 'Clair',
			'user.preferences.themes.dark' => 'Sombre',
			'user.account.title' => 'Mon compte',
			'user.account.name' => 'Nom',
			'user.account.email' => 'Adresse e-mail',
			'user.account.logout' => 'Se déconnecter',
			'user.account.logoutConfirm' => 'Voulez-vous vraiment vous déconnecter ?',
			'user.contents.title' => 'Mes contenus',
			'validations.screens.event' => 'Valider l\'événement',
			'validations.screens.adjust' => 'Demander un ajustement',
			_ => null,
		};
	}
}
