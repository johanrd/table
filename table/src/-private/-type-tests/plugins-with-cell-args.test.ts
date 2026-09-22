import { expectTypeOf } from 'expect-type';

import { headlessTable } from '../../index.ts';
import {
  ColumnOrder,
  moveLeft,
  moveRight,
  orderedColumnsFor,
  setColumnOrder,
} from '../../plugins/column-reordering/index.ts';
import { isResizable } from '../../plugins/column-resizing/index.ts';
import {
  hide,
  isVisible,
  show,
} from '../../plugins/column-visibility/index.ts';
import { isAscending, sort } from '../../plugins/data-sorting/index.ts';
import { isSticky } from '../../plugins/sticky-columns/index.ts';
import { columns, meta } from '../../plugins/index.ts';
import { ColumnVisibility } from '../../plugins/column-visibility/index.ts';

import type { CellContext, Column } from '../../index.ts';
import type { ComponentLike } from '@glint/template';

interface Person {
  name: string;
}
declare const people: Person[];

/////////////////////////////////////////////
// The plugins take a column whose Cell asks for args.
// The args sit in the args of `Cell`, so a column carrying them
// does not fit a `Column<Person>` parameter on its own.
declare const GroupedCell: ComponentLike<
  CellContext<Person> & { groupBy: 'day' | 'week' }
>;

const table = headlessTable(
  {},
  {
    columns: () => [
      { key: 'name', Cell: GroupedCell, meta: { align: 'left' } },
    ],
    data: () => people,
  },
);

const column = table.columns[0]!;

expectTypeOf(isVisible(column)).toEqualTypeOf<boolean>();
expectTypeOf(isAscending(column)).toEqualTypeOf<boolean>();
expectTypeOf(isResizable(column)).toEqualTypeOf<boolean>();
expectTypeOf(isSticky(column)).toEqualTypeOf<boolean>();
hide(column);
show(column);
sort(column);
moveLeft(column);
moveRight(column);
meta.forColumn(column, ColumnVisibility);

// an order is built from the columns of the table it orders
setColumnOrder(table, new ColumnOrder({ columns: () => [column] }));

// the column list helpers keep the args, and the meta with them
expectTypeOf(columns.for(table)[0]!.meta?.align).toEqualTypeOf<
  'left' | undefined
>();
expectTypeOf(orderedColumnsFor(table)[0]!.meta?.align).toEqualTypeOf<
  'left' | undefined
>();

// Code of your own that reads a column takes the args as a parameter.
// `Column<Person>` alone cannot accept it: the args are in the args of `Cell`,
// so a column that requires them is not a column that does not.
function takesAnyColumn<CellArgs>(
  column: Column<Person, unknown, unknown, CellArgs>,
) {
  return column.key;
}
takesAnyColumn(column);
