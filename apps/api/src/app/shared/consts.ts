import { classes, sizes, parts, IUserOptions } from '@pdrc/api-interfaces';

export const DEFAULT_USER_OPTIONS: IUserOptions = {
  parts,
  classes,
  sizes,
  columns: [0, 1, 2],
  tables: [
    {
      rows: [0, 1, 2],
      title: 'Regular prices',
      values: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    },
  ],
};
