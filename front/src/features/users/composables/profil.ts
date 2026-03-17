import type { FamilyData } from '@features/users/data/families';
import { families } from '@features/users/data/families';
import { type UserData, UserProfilType } from '@features/users/data/users';
import { ref } from 'vue';

const isValid = ref(false);
const current = ref<FamilyData | null>(null);
const type = ref<UserProfilType | null>(null);

export const useProfil = () => {

    async function create(userId: string, profilType: UserProfilType)
    {
        let profil;
        if (profilType == UserProfilType.PERSONNAL)
        {
            // Check if already existing and create it if not
            profil = await families.getByUser(userId);
            if (!profil)
                profil = await families.create({user: userId, name: ""} as FamilyData);
        }
        
        if(profil) set(profilType, profil);
    }

    async function refresh(user: UserData | null) {
        if (!user?.type) {
            reset();
            return;
        }

        // Get corresponding profil
        let profil;
        if (user.type == UserProfilType.PERSONNAL)
            profil = await families.getByUser(user.id);
        
        if (profil) set(user.type, profil);
    }

    function reset() {
        current.value = null;
        type.value = null;
        isValid.value = false;
    }

    function set(profilType: UserProfilType, profil: FamilyData) {
        current.value = profil;
        type.value = profilType;
        isValid.value = !!current.value;
    }

    return {
        current,
        isValid,
        type,
        refresh,
        reset,
        set,
        create
    };
}