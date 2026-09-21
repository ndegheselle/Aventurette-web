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
	ActivitiesDevelopAffect: "activities_develop_affect",
	ActivitiesDevelopSocial: "activities_develop_social",
	ActivitiesDevelopIntellectual: "activities_develop_intellectual",
	ActivitiesDevelopMoral: "activities_develop_moral",
	ActivitiesDevelopPhysical: "activities_develop_physical",
	ActivitiesDevelopSpiritual: "activities_develop_spiritual",
	ActivitiesFields: "activities_fields",
	ActivitiesImaginary: "activities_imaginary",
	ActivitiesSecurity: "activities_security",
	ActivitiesSteps: "activities_steps",
	StepsMaterials: "steps_materials",
	StepsResources: "steps_resources",
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

export const ActivitiesEnvironnementOptions = {
	"PARK": "PARK",
	"HOUSE": "HOUSE",
	"BALCONY": "BALCONY",
	"CAR": "CAR",
	"OUTDOOR": "OUTDOOR",
	"CITY": "CITY",
	"CAMPAIGN": "CAMPAIGN",
	"FOREST": "FOREST",
	"MOUTAIN": "MOUTAIN",
	"POOL": "POOL",
	"LAKE": "LAKE",
	"RIVER": "RIVER",
	"BATH": "BATH",
	"MEAL": "MEAL",
} as const
export type ActivitiesEnvironnementOptions = typeof ActivitiesEnvironnementOptions[keyof typeof ActivitiesEnvironnementOptions]

export const ActivitiesSeasonOptions = {
	"AUTUMN": "AUTUMN",
	"WINTER": "WINTER",
	"SPRING": "SPRING",
	"SUMMER": "SUMMER",
	"CHRISTMAS": "CHRISTMAS",
	"NEW YEAR": "NEW YEAR",
	"HALLOWEEN": "HALLOWEEN",
	"EASTER": "EASTER",
	"VALENTINE": "VALENTINE",
} as const
export type ActivitiesSeasonOptions = typeof ActivitiesSeasonOptions[keyof typeof ActivitiesSeasonOptions]

export const ActivitiesWeatherOptions = {
	"RAIN": "RAIN",
	"SNOW": "SNOW",
	"SUNNY": "SUNNY",
	"WINDY": "WINDY",
} as const
export type ActivitiesWeatherOptions = typeof ActivitiesWeatherOptions[keyof typeof ActivitiesWeatherOptions]

export const ActivitiesEnergyLevelOptions = {
	"LOW": "LOW",
	"MEDIUM": "MEDIUM",
	"HIGH": "HIGH",
} as const
export type ActivitiesEnergyLevelOptions = typeof ActivitiesEnergyLevelOptions[keyof typeof ActivitiesEnergyLevelOptions]
export type ActivitiesRecord = {
	age_max: number
	age_min: number
	created: IsoAutoDateString
	description: HTMLString
	develop_affect?: RecordIdString[]
	develop_social?: RecordIdString[]
	develop_intellectual?: RecordIdString[]
	develop_moral?: RecordIdString[]
	develop_physical?: RecordIdString[]
	develop_spritual?: RecordIdString[]
	energy_level?: ActivitiesEnergyLevelOptions
	environnement: ActivitiesEnvironnementOptions
	fields?: RecordIdString[]
	id: string
	imaginary?: RecordIdString[]
	name: string
	participants_max: number
	participants_min: number
	recommended_hosts_numbers?: number
	season?: ActivitiesSeasonOptions
	security?: RecordIdString[]
	state: ActivitiesStateOptions
	steps?: RecordIdString[]
	updated: IsoAutoDateString
	user: RecordIdString
	visual?: FileNameString
	weather?: ActivitiesWeatherOptions
}

export type ActivitiesDevelopAffectRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesDevelopSocialRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesDevelopIntellectualRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesDevelopMoralRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesDevelopPhysicalRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesDevelopSpiritualRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesFieldsRecord = {
	created: IsoAutoDateString
	id: string
	name?: string
	updated: IsoAutoDateString
}

export type ActivitiesImaginaryRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesSecurityRecord = {
	created: IsoAutoDateString
	description?: HTMLString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesStepsRecord = {
	activity: RecordIdString
	created: IsoAutoDateString
	description: HTMLString
	id: string
	materials?: RecordIdString[]
	resources?: RecordIdString[]
	updated: IsoAutoDateString
}

export type StepsMaterialsRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	step: RecordIdString
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

export const UsersTypeOptions = {
	"PERSONNAL": "PERSONNAL",
	"ASSOCIATION": "ASSOCIATION",
	"SCHOOL": "SCHOOL",
} as const
export type UsersTypeOptions = typeof UsersTypeOptions[keyof typeof UsersTypeOptions]
export type UsersRecord = {
	created: IsoAutoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
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
export type ActivitiesDevelopAffectResponse<Texpand = unknown> = Required<ActivitiesDevelopAffectRecord> & BaseSystemFields<Texpand>
export type ActivitiesDevelopSocialResponse<Texpand = unknown> = Required<ActivitiesDevelopSocialRecord> & BaseSystemFields<Texpand>
export type ActivitiesDevelopIntellectualResponse<Texpand = unknown> = Required<ActivitiesDevelopIntellectualRecord> & BaseSystemFields<Texpand>
export type ActivitiesDevelopMoralResponse<Texpand = unknown> = Required<ActivitiesDevelopMoralRecord> & BaseSystemFields<Texpand>
export type ActivitiesDevelopPhysicalResponse<Texpand = unknown> = Required<ActivitiesDevelopPhysicalRecord> & BaseSystemFields<Texpand>
export type ActivitiesDevelopSpiritualResponse<Texpand = unknown> = Required<ActivitiesDevelopSpiritualRecord> & BaseSystemFields<Texpand>
export type ActivitiesFieldsResponse<Texpand = unknown> = Required<ActivitiesFieldsRecord> & BaseSystemFields<Texpand>
export type ActivitiesImaginaryResponse<Texpand = unknown> = Required<ActivitiesImaginaryRecord> & BaseSystemFields<Texpand>
export type ActivitiesSecurityResponse<Texpand = unknown> = Required<ActivitiesSecurityRecord> & BaseSystemFields<Texpand>
export type ActivitiesStepsResponse<Texpand = unknown> = Required<ActivitiesStepsRecord> & BaseSystemFields<Texpand>
export type StepsMaterialsResponse<Texpand = unknown> = Required<StepsMaterialsRecord> & BaseSystemFields<Texpand>
export type StepsResourcesResponse<Texpand = unknown> = Required<StepsResourcesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	activities: ActivitiesRecord
	activities_develop_affect: ActivitiesDevelopAffectRecord
	activities_develop_social: ActivitiesDevelopSocialRecord
	activities_develop_intellectual: ActivitiesDevelopIntellectualRecord
	activities_develop_moral: ActivitiesDevelopMoralRecord
	activities_develop_physical: ActivitiesDevelopPhysicalRecord
	activities_develop_spiritual: ActivitiesDevelopSpiritualRecord
	activities_fields: ActivitiesFieldsRecord
	activities_imaginary: ActivitiesImaginaryRecord
	activities_security: ActivitiesSecurityRecord
	activities_steps: ActivitiesStepsRecord
	steps_materials: StepsMaterialsRecord
	steps_resources: StepsResourcesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	activities: ActivitiesResponse
	activities_develop_affect: ActivitiesDevelopAffectResponse
	activities_develop_social: ActivitiesDevelopSocialResponse
	activities_develop_intellectual: ActivitiesDevelopIntellectualResponse
	activities_develop_moral: ActivitiesDevelopMoralResponse
	activities_develop_physical: ActivitiesDevelopPhysicalResponse
	activities_develop_spiritual: ActivitiesDevelopSpiritualResponse
	activities_fields: ActivitiesFieldsResponse
	activities_imaginary: ActivitiesImaginaryResponse
	activities_security: ActivitiesSecurityResponse
	activities_steps: ActivitiesStepsResponse
	steps_materials: StepsMaterialsResponse
	steps_resources: StepsResourcesResponse
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
