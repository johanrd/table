import { expectTypeOf } from 'expect-type';

import { headlessTable } from '../../index.ts';
import { isVisible, hide } from '../../plugins/column-visibility/index.ts';
import { sort } from '../../plugins/data-sorting/index.ts';

import type { AnyColumn, AnyTable, CellContext, Column } from '../../index.ts';
import type { ComponentLike } from '@glint/template';

interface Person {
  name: string;
}
declare const people: Person[];

declare const GroupedCell: ComponentLike<
  CellContext<Person> & { groupBy: 'day' | 'week' }
>;

const table = headlessTable(
  {},
  {
    columns: () => [{ key: 'name', Cell: GroupedCell, meta: { width: 120 } }],
    data: () => people,
  },
);

/////////////////////////////////////////////
// `Column` keeps a Cell that is checked: a Cell of a column written by hand
// still takes `@row` and `@column`, and nothing else.
expectTypeOf<NonNullable<Column<Person>['Cell']>>().toEqualTypeOf<
  ComponentLike<CellContext<Person, unknown, any>>
>();

/////////////////////////////////////////////
// `AnyColumn` is the column of any table: what its Cell takes is not known here.
expectTypeOf<NonNullable<AnyColumn<Person>['Cell']>>().toEqualTypeOf<
  ComponentLike<any>
>();

// Code that reads a column takes any column, whatever its Cells ask for.
function keyOf(column: AnyColumn<Person>) {
  return column.key;
}
function widthOf(column: AnyColumn<Person, { width?: number }>) {
  return column.meta?.width;
}
function columnCount(table: AnyTable<Person>) {
  return table.columns.length;
}

keyOf(table.columns[0]!);
widthOf(table.columns[0]!);
columnCount(table);

// and so do the plugins
isVisible(table.columns[0]!);
hide(table.columns[0]!);
sort(table.columns[0]!);
