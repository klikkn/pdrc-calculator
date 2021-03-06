type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<
  infer ElementType
>
  ? ElementType
  : never;

export const enum Role {
  Admin = 'admin',
  User = 'user',
}

export const _parts = [
  'doorFrontLeft',
  'doorFrontRight',
  'doorBackLeft',
  'doorBackRight',
  'wingFrontLeft',
  'wingFrontRight',
  'wingBackLeft',
  'wingBackRight',
  'rackLeft',
  'rackRight',
  'hood',
  'trunk',
  'roof',
] as const;
export const _sizes = [
  '1-3',
  '3-5',
  '5-10',
  '10-20',
  '20-40',
  '40-70',
] as const;
export const _classes = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export const parts = [..._parts];
export const sizes = [..._sizes];
export const classes = [..._classes];

export type Part = ElementType<typeof _parts>;
export type Size = ElementType<typeof _sizes>;
export type CarClass = ElementType<typeof _classes>;
