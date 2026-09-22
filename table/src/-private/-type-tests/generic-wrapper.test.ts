import { expectTypeOf } from 'expect-type';

import { headlessTable } from '../../index.ts';

import type { CellContext, ColumnConfig } from '../../index.ts';
import type { ComponentLike } from '@glint/template';

interface Person {
  name: string;
}
declare const people: Person[];

// A shared table component takes a column list from its caller and builds the
// table itself. Its own cell args are a type parameter, so there is no Cell to
// read them from.
function makeTable<T, CellArgs>(
  columnConfigList: ColumnConfig<T, unknown, unknown, CellArgs>[],
  data: T[],
) {
  return headlessTable(
    {},
    { columns: () => columnConfigList, data: () => data },
  );
}

declare const columnList: ColumnConfig<
  Person,
  unknown,
  unknown,
  { groupBy: 'day' | 'week' }
>[];

const table = makeTable(columnList, people);

expectTypeOf(table.columns[0]!.Cell).toEqualTypeOf<
  | ComponentLike<
      CellContext<Person, unknown, unknown> & { groupBy: 'day' | 'week' }
    >
  | undefined
>();
