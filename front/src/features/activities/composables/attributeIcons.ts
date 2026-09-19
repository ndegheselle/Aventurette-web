import {
    BabyIcon,
    CloudSunIcon,
    ClockIcon,
    HourglassIcon,
    ImageIcon,
    MapIcon,
    ShapesIcon,
    ShieldCheckIcon,
    SparklesIcon,
    TagIcon,
    TrendingUpIcon,
    UserRoundIcon,
    UsersIcon,
    ZapIcon,
    type LucideIcon,
} from 'lucide-vue-next';

/**
 * The icon each attribute is shown with, by slug. Kept here rather than in the catalogue: an
 * icon is a view decision, and a lucide name stored in the database could not be imported by
 * its own name ([ADR 0005](docs/adr/0005-icons-imported-directly.md)).
 *
 * A slug with no entry falls back, so seeding a new attribute needs nothing here.
 */
const icons: Record<string, LucideIcon> = {
    'environnement': MapIcon,
    'age': BabyIcon,
    'nombre-enfants': UsersIcon,
    'nombre-animateurs': UserRoundIcon,
    'temps-preparation': HourglassIcon,
    'temps-jeu': ClockIcon,
    'domaine': ShapesIcon,
    'saison': CloudSunIcon,
    'meteo': CloudSunIcon,
    'niveau-energie': ZapIcon,
    'securite': ShieldCheckIcon,
    'visuel-principal': ImageIcon,
    'imaginaire': SparklesIcon,
};

/** The developmental groups all share one, so the six of them need no entry each. */
const DEVELOPMENT = 'developpement-';

export function attributeIcon(slug: string): LucideIcon {
    if (slug.startsWith(DEVELOPMENT)) return TrendingUpIcon;

    return icons[slug] ?? TagIcon;
}
