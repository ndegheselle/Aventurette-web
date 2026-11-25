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
import type { ImportProblem } from '@features/activities-authoring/models/fiche.import';
import { glossaryCounts } from '@features/activities-authoring/models/glossary.import';
import { routesNames } from '@features/activities-authoring/routes';
import { CircleAlertIcon, CircleCheckIcon, FileArchiveIcon, TriangleAlertIcon, UploadIcon } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

const {
    fileName,
    isChecking,
    isImporting,
    unreadable,
    report,
    results,
    isDone,
    blocked,
    canImport,
    check,
    run,
} = useActivitiesImport();

const { t } = useI18n();

useNavbar(t('activities.authoring.import.title'));

function picked(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) check(file);
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
            <Input type="file" accept=".zip,application/zip" :disabled="isChecking || isImporting" @change="picked" />
            <p v-if="isChecking" class="flex items-center gap-2 text-sm">
                <Spinner /> {{ $t('activities.authoring.import.checking', { name: fileName }) }}
            </p>
            <Alert v-if="unreadable" variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>{{ $t('activities.authoring.import.unreadable', { name: fileName }) }}</AlertTitle>
            </Alert>
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
                    {{ $t('activities.authoring.import.glossary.changes', glossaryCounts(report.glossary.plan)) }}
                </p>
                <ul v-if="report.glossary.problems.length" class="text-sm text-destructive list-disc ps-4">
                    <li v-for="(problem, index) in report.glossary.problems" :key="index">{{ messageOf(problem) }}</li>
                </ul>
            </Panel>

            <Panel v-for="item in report.fiches" :key="item.folder.name">
                <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-lg font-medium">{{ item.fiche?.name ?? item.folder.name }}</h3>
                    <span class="text-sm text-muted-foreground">{{ item.folder.name }}</span>
                    <Badge v-if="!item.fiche" variant="destructive">{{ $t('activities.authoring.import.unreadableFiche') }}</Badge>
                    <Badge v-else-if="item.existing" variant="secondary">{{ $t('activities.authoring.import.update') }}</Badge>
                    <Badge v-else variant="outline">{{ $t('activities.authoring.import.create') }}</Badge>
                    <template v-if="results[item.folder.name]">
                        <Badge v-if="results[item.folder.name]?.saved" class="ms-auto">
                            <CircleCheckIcon /> {{ $t('activities.authoring.import.saved') }}
                        </Badge>
                        <Badge v-else variant="destructive" class="ms-auto">
                            {{ $t('activities.authoring.import.failed', { message: (results[item.folder.name] as { message: string }).message }) }}
                        </Badge>
                    </template>
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
                <p v-if="blocked" class="text-sm text-destructive">{{ $t('activities.authoring.import.blocked') }}</p>
                <Button v-if="isDone" variant="secondary" class="ms-auto" as-child>
                    <RouterLink :to="{ name: routesNames.all }">{{ $t('activities.authoring.import.back') }}</RouterLink>
                </Button>
                <Button v-else class="ms-auto" :disabled="!canImport" @click="run">
                    <Spinner v-if="isImporting" />
                    <UploadIcon v-else />
                    {{ $t('activities.authoring.import.run', report.fiches.length) }}
                </Button>
            </div>
        </template>
    </Container>
</template>
