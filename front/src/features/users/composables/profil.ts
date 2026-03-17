import type { FamilyData } from '@features/users/data/families';
import { families } from '@features/users/data/families';
import { type UserData, UserProfilType } from '@features/users/data/users';
import { ref } from 'vue';

const isValid = ref(false);
const current = ref<FamilyData | null>(null);
const type = ref<UserProfilType | null>(null);

export const useProfil = () => {

    async function refresh(user: UserData) {
        if (!user.type) {
            isValid.value = false;
        }
        else {
            // Get corresponding profil
            if (user.type == UserProfilType.PERSONNAL)
                current.value = await families.getByUser(user.id);
            type.value = user.type;
            isValid.value = !!current.value;
        }
    }

    function reset() {
        current.value = null;
        isValid.value = false;
    }

    return {
        current,
        isValid,
        type,
        refresh,
        reset
    };
}