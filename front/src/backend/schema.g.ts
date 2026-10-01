/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export const Collections = {
	Authorigins: "_authOrigins",
	Externalauths: "_externalAuths",
	Mfas: "_mfas",
	Otps: "_otps",
	Superusers: "_superusers",
	Activities: "activities",
	ActivitiesMaterials: "activities_materials",
	ActivitiesSteps: "activities_steps",
	ActivitiesWorkshops: "activities_workshops",
	Materials: "materials",
	SafetyInstructions: "safety_instructions",
	StepsResources: "steps_resources",
	Tags: "tags",
	Tips: "tips",
	Users: "users",
} as const
export type Collections = typeof Collections[keyof typeof Collections]

// Alias types for improved usability
export type IsoDateString = string
export type IsoAutoDateString = string & { readonly autodate: unique symbol }
export type RecordIdString = string
export type FileNameString = string & { readonly filename: unique symbol }
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated: IsoAutoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated: IsoAutoDateString
}

export type MfasRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	method: string
	recordRef: string
	updated: IsoAutoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created: IsoAutoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated: IsoAutoDateString
}

export type SuperusersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated: IsoAutoDateString
	verified?: boolean
}

export const ActivitiesStateOptions = {
	"DRAFT": "DRAFT",
	"PUBLISHED": "PUBLISHED",
} as const
export type ActivitiesStateOptions = typeof ActivitiesStateOptions[keyof typeof ActivitiesStateOptions]

export const ActivitiesHostEffortOptions = {
	"LOW": "LOW",
	"MEDIUM": "MEDIUM",
	"HIGH": "HIGH",
} as const
export type ActivitiesHostEffortOptions = typeof ActivitiesHostEffortOptions[keyof typeof ActivitiesHostEffortOptions]

export const ActivitiesFormatOptions = {
	"SMALL_GAME": "SMALL_GAME",
	"BIG_GAME": "BIG_GAME",
	"WORKSHOP": "WORKSHOP",
} as const
export type ActivitiesFormatOptions = typeof ActivitiesFormatOptions[keyof typeof ActivitiesFormatOptions]

export const ActivitiesPracticesOptions = {
	"MANUAL_CREATION": "MANUAL_CREATION",
	"EXPRESSION": "EXPRESSION",
	"COOKING": "COOKING",
	"OBSERVATION": "OBSERVATION",
	"MUSIC": "MUSIC",
	"EXPERIMENTATION": "EXPERIMENTATION",
} as const
export type ActivitiesPracticesOptions = typeof ActivitiesPracticesOptions[keyof typeof ActivitiesPracticesOptions]

export const ActivitiesImaginaryRuleOptions = {
	"NONE": "NONE",
	"ADAPTABLE": "ADAPTABLE",
	"REQUIRED": "REQUIRED",
} as const
export type ActivitiesImaginaryRuleOptions = typeof ActivitiesImaginaryRuleOptions[keyof typeof ActivitiesImaginaryRuleOptions]

export const ActivitiesChildrenPaceOptions = {
	"CALM": "CALM",
	"DYNAMIC": "DYNAMIC",
} as const
export type ActivitiesChildrenPaceOptions = typeof ActivitiesChildrenPaceOptions[keyof typeof ActivitiesChildrenPaceOptions]

export const ActivitiesLocationsOptions = {
	"PARK": "PARK",
	"HOUSE": "HOUSE",
	"BALCONY": "BALCONY",
	"CAR": "CAR",
	"CITY": "CITY",
	"CAMPAIGN": "CAMPAIGN",
	"FOREST": "FOREST",
	"MOUNTAIN": "MOUNTAIN",
	"POOL": "POOL",
	"LAKE": "LAKE",
	"RIVER": "RIVER",
	"BATH": "BATH",
	"MEAL": "MEAL",
} as const
export type ActivitiesLocationsOptions = typeof ActivitiesLocationsOptions[keyof typeof ActivitiesLocationsOptions]

export const ActivitiesSeasonsOptions = {
	"AUTUMN": "AUTUMN",
	"WINTER": "WINTER",
	"SPRING": "SPRING",
	"SUMMER": "SUMMER",
} as const
export type ActivitiesSeasonsOptions = typeof ActivitiesSeasonsOptions[keyof typeof ActivitiesSeasonsOptions]
export type ActivitiesRecord = {
	age_max?: number
	age_min?: number
	age_variants?: HTMLString
	children_pace?: ActivitiesChildrenPaceOptions
	conditions?: HTMLString
	created: IsoAutoDateString
	cross_supervision?: boolean
	description?: HTMLString
	development_tags?: RecordIdString[]
	format?: ActivitiesFormatOptions
	goal_tags?: RecordIdString[]
	host_effort?: ActivitiesHostEffortOptions
	id: string
	ideal_for_tags?: RecordIdString[]
	imaginary_rule?: ActivitiesImaginaryRuleOptions
	imaginary_tags?: RecordIdString[]
	indoor?: boolean
	locations?: ActivitiesLocationsOptions[]
	materials?: RecordIdString[]
	name: string
	outdoor?: boolean
	participants_max?: number
	participants_min?: number
	practices?: ActivitiesPracticesOptions[]
	recommended_hosts_numbers?: number
	safety_instructions?: RecordIdString[]
	seasons?: ActivitiesSeasonsOptions[]
	state: ActivitiesStateOptions
	steps?: RecordIdString[]
	supervision_notes?: HTMLString
	theme_tags?: RecordIdString[]
	tips?: RecordIdString[]
	updated: IsoAutoDateString
	user: RecordIdString
	visual?: FileNameString
	visual_brief?: string
	workshops?: RecordIdString[]
}

export type ActivitiesMaterialsRecord = {
	activity: RecordIdString
	created: IsoAutoDateString
	id: string
	material: RecordIdString
	quantity?: string
	updated: IsoAutoDateString
}

export const ActivitiesStepsKindOptions = {
	"PREPARE": "PREPARE",
	"CUSTOM": "CUSTOM",
	"CONCLUSION": "CONCLUSION",
} as const
export type ActivitiesStepsKindOptions = typeof ActivitiesStepsKindOptions[keyof typeof ActivitiesStepsKindOptions]

export const ActivitiesStepsEndCriteriaOptions = {
	"TIME_UP": "TIME_UP",
	"ENOUGH_DONE": "ENOUGH_DONE",
	"ATTENTION_DROPS": "ATTENTION_DROPS",
	"TEAM_WON": "TEAM_WON",
} as const
export type ActivitiesStepsEndCriteriaOptions = typeof ActivitiesStepsEndCriteriaOptions[keyof typeof ActivitiesStepsEndCriteriaOptions]
export type ActivitiesStepsRecord<Tactions = unknown> = {
	actions?: null | Tactions
	activity: RecordIdString
	created: IsoAutoDateString
	description: HTMLString
	duration?: number
	end_criteria?: ActivitiesStepsEndCriteriaOptions[]
	end_criteria_other?: string
	id: string
	kind: ActivitiesStepsKindOptions
	materials?: RecordIdString[]
	resources?: RecordIdString[]
	title?: string
	updated: IsoAutoDateString
	visual_brief?: string
}

export type ActivitiesWorkshopsRecord = {
	activity: RecordIdString
	adults_required?: number
	challenges?: HTMLString
	created: IsoAutoDateString
	id: string
	materials?: RecordIdString[]
	name: string
	theme?: string
	updated: IsoAutoDateString
}

export type MaterialsRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type SafetyInstructionsRecord = {
	created: IsoAutoDateString
	description?: HTMLString
	id: string
	name: string
	slug: string
	updated: IsoAutoDateString
}

export type StepsResourcesRecord = {
	created: IsoAutoDateString
	file?: FileNameString
	id: string
	name: string
	step: RecordIdString
	updated: IsoAutoDateString
}

export const TagsTypeOptions = {
	"THEME": "THEME",
	"IMAGINARY": "IMAGINARY",
	"GOAL": "GOAL",
	"IDEAL_FOR": "IDEAL_FOR",
	"DEVELOP_PHYSICAL": "DEVELOP_PHYSICAL",
	"DEVELOP_INTELLECTUAL": "DEVELOP_INTELLECTUAL",
	"DEVELOP_AFFECT": "DEVELOP_AFFECT",
	"DEVELOP_SOCIAL": "DEVELOP_SOCIAL",
	"DEVELOP_MORAL": "DEVELOP_MORAL",
	"DEVELOP_SPIRITUAL": "DEVELOP_SPIRITUAL",
} as const
export type TagsTypeOptions = typeof TagsTypeOptions[keyof typeof TagsTypeOptions]
export type TagsRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	slug: string
	type: TagsTypeOptions
	updated: IsoAutoDateString
}

export type TipsRecord = {
	created: IsoAutoDateString
	description?: HTMLString
	id: string
	name: string
	updated: IsoAutoDateString
}

export const UsersTypeOptions = {
	"PERSONNAL": "PERSONNAL",
	"ASSOCIATION": "ASSOCIATION",
	"SCHOOL": "SCHOOL",
} as const
export type UsersTypeOptions = typeof UsersTypeOptions[keyof typeof UsersTypeOptions]

export const UsersRoleOptions = {
	"USER": "USER",
	"ADMIN": "ADMIN",
} as const
export type UsersRoleOptions = typeof UsersRoleOptions[keyof typeof UsersRoleOptions]
export type UsersRecord = {
	avatar?: FileNameString
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
	password: string
	role?: UsersRoleOptions
	tokenKey: string
	type?: UsersTypeOptions
	updated: IsoAutoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type ActivitiesResponse<Texpand = unknown> = Required<ActivitiesRecord> & BaseSystemFields<Texpand>
export type ActivitiesMaterialsResponse<Texpand = unknown> = Required<ActivitiesMaterialsRecord> & BaseSystemFields<Texpand>
export type ActivitiesStepsResponse<Tactions = unknown, Texpand = unknown> = Required<ActivitiesStepsRecord<Tactions>> & BaseSystemFields<Texpand>
export type ActivitiesWorkshopsResponse<Texpand = unknown> = Required<ActivitiesWorkshopsRecord> & BaseSystemFields<Texpand>
export type MaterialsResponse<Texpand = unknown> = Required<MaterialsRecord> & BaseSystemFields<Texpand>
export type SafetyInstructionsResponse<Texpand = unknown> = Required<SafetyInstructionsRecord> & BaseSystemFields<Texpand>
export type StepsResourcesResponse<Texpand = unknown> = Required<StepsResourcesRecord> & BaseSystemFields<Texpand>
export type TagsResponse<Texpand = unknown> = Required<TagsRecord> & BaseSystemFields<Texpand>
export type TipsResponse<Texpand = unknown> = Required<TipsRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	activities: ActivitiesRecord
	activities_materials: ActivitiesMaterialsRecord
	activities_steps: ActivitiesStepsRecord
	activities_workshops: ActivitiesWorkshopsRecord
	materials: MaterialsRecord
	safety_instructions: SafetyInstructionsRecord
	steps_resources: StepsResourcesRecord
	tags: TagsRecord
	tips: TipsRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	activities: ActivitiesResponse
	activities_materials: ActivitiesMaterialsResponse
	activities_steps: ActivitiesStepsResponse
	activities_workshops: ActivitiesWorkshopsResponse
	materials: MaterialsResponse
	safety_instructions: SafetyInstructionsResponse
	steps_resources: StepsResourcesResponse
	tags: TagsResponse
	tips: TipsResponse
	users: UsersResponse
}

// Utility types for create/update operations

type ProcessCreateAndUpdateFields<T> = Omit<{
	// Omit AutoDate fields
	[K in keyof T as Extract<T[K], IsoAutoDateString> extends never ? K : never]: 
		// Convert FileNameString to File
		T[K] extends infer U ? 
			U extends (FileNameString | FileNameString[]) ? 
				U extends any[] ? File[] : File 
			: U
		: never
}, 'id'>

// Create type for Auth collections
export type CreateAuth<T> = {
	id?: RecordIdString
	email: string
	emailVisibility?: boolean
	password: string
	passwordConfirm: string
	verified?: boolean
} & ProcessCreateAndUpdateFields<T>

// Create type for Base collections
export type CreateBase<T> = {
	id?: RecordIdString
} & ProcessCreateAndUpdateFields<T>

// Update type for Auth collections
export type UpdateAuth<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof AuthSystemFields>
> & {
	email?: string
	emailVisibility?: boolean
	oldPassword?: string
	password?: string
	passwordConfirm?: string
	verified?: boolean
}

// Update type for Base collections
export type UpdateBase<T> = Partial<
	Omit<ProcessCreateAndUpdateFields<T>, keyof BaseSystemFields>
>

// Get the correct create type for any collection
export type Create<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? CreateAuth<CollectionRecords[T]>
		: CreateBase<CollectionRecords[T]>

// Get the correct update type for any collection
export type Update<T extends keyof CollectionResponses> =
	CollectionResponses[T] extends AuthSystemFields
		? UpdateAuth<CollectionRecords[T]>
		: UpdateBase<CollectionRecords[T]>

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = {
	collection<T extends keyof CollectionResponses>(
		idOrName: T
	): RecordService<CollectionResponses[T]>
} & PocketBase
