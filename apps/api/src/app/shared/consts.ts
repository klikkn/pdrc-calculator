import { classes, sizes, parts, IUserOptions } from '@pdrc/api-interfaces';

export const DEFAULT_USER_OPTIONS: IUserOptions = {
  parts,
  classes,
  sizes,
  columns: [0, 1, 2, 3, 4, 5],
  tables: [
    {
      rows: [0, 1, 2, 3, 4, 5],
      title: 'Regular prices',
      values: [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
      ],
    },
  ],
};
