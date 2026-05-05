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
	ActivitiesResources: "activities_resources",
	ActivitiesSteps: "activities_steps",
	Benefits: "benefits",
	Childrens: "childrens",
	Interests: "interests",
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

export const ActivitiesEnvironmentOptions = {
	"INDOOR": "INDOOR",
	"OUTDOOR": "OUTDOOR",
	"CLASSROOM": "CLASSROOM",
	"CAR": "CAR",
} as const
export type ActivitiesEnvironmentOptions = typeof ActivitiesEnvironmentOptions[keyof typeof ActivitiesEnvironmentOptions]
export type ActivitiesRecord = {
	ageMax?: number
	ageMin?: number
	benefits?: RecordIdString[]
	created: IsoAutoDateString
	description: HTMLString
	durationMinutes?: number
	environment: ActivitiesEnvironmentOptions
	id: string
	materials?: RecordIdString[]
	name: string
	resources?: RecordIdString[]
	steps?: RecordIdString[]
	summary: string
	updated: IsoAutoDateString
	user: RecordIdString
}

export type ActivitiesMaterialsRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesResourcesRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ActivitiesStepsRecord = {
	created: IsoAutoDateString
	description: HTMLString
	id: string
	materials?: RecordIdString[]
	resources?: RecordIdString[]
	updated: IsoAutoDateString
}

export type BenefitsRecord = {
	created: IsoAutoDateString
	id: string
	name: string
	updated: IsoAutoDateString
}

export type ChildrensRecord = {
	age?: number
	created: IsoAutoDateString
	id: string
	interests?: RecordIdString[]
	name?: string
	updated: IsoAutoDateString
	user: RecordIdString
}

export type InterestsRecord = {
	created: IsoAutoDateString
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
export type UsersRecord = {
	childrens?: RecordIdString[]
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
export type ActivitiesMaterialsResponse<Texpand = unknown> = Required<ActivitiesMaterialsRecord> & BaseSystemFields<Texpand>
export type ActivitiesResourcesResponse<Texpand = unknown> = Required<ActivitiesResourcesRecord> & BaseSystemFields<Texpand>
export type ActivitiesStepsResponse<Texpand = unknown> = Required<ActivitiesStepsRecord> & BaseSystemFields<Texpand>
export type BenefitsResponse<Texpand = unknown> = Required<BenefitsRecord> & BaseSystemFields<Texpand>
export type ChildrensResponse<Texpand = unknown> = Required<ChildrensRecord> & BaseSystemFields<Texpand>
export type InterestsResponse<Texpand = unknown> = Required<InterestsRecord> & BaseSystemFields<Texpand>
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
	activities_resources: ActivitiesResourcesRecord
	activities_steps: ActivitiesStepsRecord
	benefits: BenefitsRecord
	childrens: ChildrensRecord
	interests: InterestsRecord
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
	activities_resources: ActivitiesResourcesResponse
	activities_steps: ActivitiesStepsResponse
	benefits: BenefitsResponse
	childrens: ChildrensResponse
	interests: InterestsResponse
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
