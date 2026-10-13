import { useConfirmation } from '@chapelure/ui/modals/useConfirmation';
import { useAuth } from '@features/user/composables/useAuth';
import { routesNames } from '@features/user/routes';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

/** Asks first, then signs out and goes to the login page. Call it from a component: it needs the router. */
export function useLogout() {
    const { t } = useI18n();
    const { logout } = useAuth();
    const confirmation = useConfirmation();
    const router = useRouter();

    async function logoutToLogin() {
        const confirmed = await confirmation.show(t('auth.logoutConfirm.title'), t('auth.logoutConfirm.message'));
        if (!confirmed) return;

        logout();
        await router.push({ name: routesNames.login });
    }

    return { logoutToLogin };
}
