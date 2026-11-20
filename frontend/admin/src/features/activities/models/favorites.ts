import type { ActivityData } from '@features/activities/models/activity';

/** A user's favorite activities, in the order they were added. */
export type FavoritesData = {
    id: string;
    favorites: ActivityData[];
};

/** Adding an activity already in the list leaves it as it was: the list holds each one once. */
export function withFavorite(favorites: ActivityData[], activity: ActivityData): ActivityData[] {
    if (favorites.some(favorite => favorite.id === activity.id)) return favorites;
    return [...favorites, activity];
}

export function withoutFavorite(favorites: ActivityData[], activityId: string): ActivityData[] {
    return favorites.filter(favorite => favorite.id !== activityId);
}
