import { UsersTypeOptions } from '@common/database/types.g';
import type { FamilyData } from '@features/users/data/families';
import { ref } from 'vue';
import { families } from '@features/users/data/families';
import type { UserData } from '@features/users/data/users';

const withValidProfil = ref(false);
const profil = ref<FamilyData | null>();

export const useProfil = () => {

    async function refresh(user: UserData) {
        if (!user.type) {
            withValidProfil.value = false;
        }
        else {
            // Get corresponding profil
            if (user.type == UsersTypeOptions.FAMILY)
                profil.value = await families.getByUser(user.id);

            withValidProfil.value = !!profil.value;
        }
    }

    function reset() {
        profil.value = null;
        withValidProfil.value = false;
    }

    return {
        profil,
        withValidProfil,
        refresh,
        reset
    };
}