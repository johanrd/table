import { headlessTable } from '../../index.ts';

import type { AnyColumn, AnyTable, CellContext } from '../../index.ts';
import type { ComponentLike } from '@glint/template';

interface Person {
  name: string;
}
declare const people: Person[];
interface MenuMeta {
  hidingDisabled?: boolean;
}

declare const GroupedCell: ComponentLike<
  CellContext<Person> & { groupBy: 'day' | 'week' }
>;

const table = headlessTable(
  {},
  {
    columns: () => [
      { key: 'name', Cell: GroupedCell, meta: { hidingDisabled: true } },
    ],
    data: () => people,
  },
);

// Code that reads a column, whatever its Cells ask for, and names no args.
function isLocked(column: AnyColumn<Person, MenuMeta>) {
  return column.meta?.hidingDisabled ?? false;
}
function columnCount(table: AnyTable<Person, MenuMeta>) {
  return table.columns.length;
}

isLocked(table.columns[0]!);
columnCount(table);
