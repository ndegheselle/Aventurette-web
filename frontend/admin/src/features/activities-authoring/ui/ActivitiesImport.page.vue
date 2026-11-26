<script setup lang="ts">
import Container from '@chapelure/ui/layout/Container.vue';
import Panel from '@chapelure/ui/layout/Panel.vue';
import { useNavbar } from '@chapelure/ui/layout/useNavbar';
import { Alert, AlertDescription, AlertTitle } from '@chapelure/ui/shadcn/alert';
import { Badge } from '@chapelure/ui/shadcn/badge';
import { Button } from '@chapelure/ui/shadcn/button';
import { Input } from '@chapelure/ui/shadcn/input';
import { Spinner } from '@chapelure/ui/shadcn/spinner';
import { useActivitiesImport } from '@features/activities-authoring/composables/useActivitiesImport';
import type { ImportProblem } from '@features/activities-authoring/models/import';
import { routesNames } from '@features/activities-authoring/routes';
import { CircleCheckIcon, FileArchiveIcon, TriangleAlertIcon, UploadIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const { file, isImporting, report, isDone, canImport, pick, run } = useActivitiesImport();

const { t } = useI18n();

useNavbar(t('activities.authoring.import.title'));

function picked(event: Event) {
    const chosen = (event.target as HTMLInputElement).files?.[0];
    if (chosen) pick(chosen);
}

function messageOf(problem: ImportProblem): string {
    return t(`activities.authoring.import.problems.${problem.code}`, {
        path: problem.path ?? '',
        value: problem.value ?? '',
        label: problem.label ? t(problem.label) : '',
    });
}

const errorsOf = (problems: ImportProblem[]) => problems.filter(problem => problem.level === 'error');
const warningsOf = (problems: ImportProblem[]) => problems.filter(problem => problem.level === 'warning');
</script>

<template>
    <Container class="flex flex-col gap-4 py-2">
        <Panel>
            <h2 class="text-2xl flex items-center gap-2">
                <FileArchiveIcon class="text-muted-foreground" /> {{ $t('activities.authoring.import.title') }}
            </h2>
            <p class="text-sm text-muted-foreground">{{ $t('activities.authoring.import.hint') }}</p>
            <div class="flex flex-wrap items-center gap-2">
                <Input type="file" accept=".zip,application/zip" class="flex-1" :disabled="isImporting" @change="picked" />
                <Button :disabled="!canImport" @click="run">
                    <Spinner v-if="isImporting" />
                    <UploadIcon v-else />
                    {{ $t('activities.authoring.import.run') }}
                </Button>
            </div>
            <p v-if="isImporting" class="flex items-center gap-2 text-sm">
                <Spinner /> {{ $t('activities.authoring.import.importing', { name: file?.name }) }}
            </p>
        </Panel>

        <template v-if="report">
            <Alert v-if="report.problems.length" :variant="errorsOf(report.problems).length ? 'destructive' : 'default'">
                <TriangleAlertIcon />
                <AlertTitle>{{ $t('activities.authoring.import.zip') }}</AlertTitle>
                <AlertDescription>
                    <ul class="list-disc ps-4">
                        <li v-for="(problem, index) in report.problems" :key="index">{{ messageOf(problem) }}</li>
                    </ul>
                </AlertDescription>
            </Alert>

            <Panel v-if="report.glossary">
                <h3 class="text-lg font-medium">{{ $t('activities.authoring.import.glossary.title') }}</h3>
                <p class="text-sm">
                    {{ $t('activities.authoring.import.glossary.changes', { created: report.glossary.created, updated: report.glossary.updated }) }}
                </p>
                <ul v-if="report.glossary.problems.length" class="text-sm text-destructive list-disc ps-4">
                    <li v-for="(problem, index) in report.glossary.problems" :key="index">{{ messageOf(problem) }}</li>
                </ul>
            </Panel>

            <Panel v-for="item in report.fiches" :key="item.folder">
                <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-lg font-medium">{{ item.name || item.folder }}</h3>
                    <span class="text-sm text-muted-foreground">{{ item.folder }}</span>
                    <Badge v-if="!item.readable" variant="destructive">{{ $t('activities.authoring.import.unreadableFiche') }}</Badge>
                    <Badge v-else-if="item.update" variant="secondary">{{ $t('activities.authoring.import.update') }}</Badge>
                    <Badge v-else variant="outline">{{ $t('activities.authoring.import.create') }}</Badge>
                    <Badge v-if="report.imported" class="ms-auto">
                        <CircleCheckIcon /> {{ $t('activities.authoring.import.saved') }}
                    </Badge>
                </div>
                <ul v-if="errorsOf(item.problems).length" class="text-sm text-destructive list-disc ps-4">
                    <li v-for="(problem, index) in errorsOf(item.problems)" :key="index">{{ messageOf(problem) }}</li>
                </ul>
                <details v-if="warningsOf(item.problems).length" class="text-sm text-muted-foreground">
                    <summary class="cursor-pointer">
                        {{ $t('activities.authoring.import.warnings', warningsOf(item.problems).length) }}
                    </summary>
                    <ul class="list-disc ps-4">
                        <li v-for="(problem, index) in warningsOf(item.problems)" :key="index">{{ messageOf(problem) }}</li>
                    </ul>
                </details>
            </Panel>

            <div class="flex flex-wrap items-center gap-2">
                <p v-if="!report.imported" class="text-sm text-destructive">{{ $t('activities.authoring.import.blocked') }}</p>
                <Button v-if="isDone" variant="secondary" class="ms-auto" as-child>
                    <RouterLink :to="{ name: routesNames.all }">{{ $t('activities.authoring.import.back') }}</RouterLink>
                </Button>
            </div>
        </template>
    </Container>
</template>
