export type Brand<T, TBrand> = T & {
	readonly __brand: TBrand
};