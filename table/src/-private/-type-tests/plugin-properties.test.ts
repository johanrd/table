import { expectTypeOf } from 'expect-type';

import { BasePlugin } from '../../plugins/index.ts';

import type { Table } from '../../index.ts';

class TableMeta {
  a = 'a';
}
class ColumnMeta {
  b = 'b';
}
class RowMeta {
  c = 'c';
}
class A extends BasePlugin<{
  Meta: { Table: TableMeta; Column: ColumnMeta; Row: RowMeta };
}> {
  name = 'a plugin';
}

const x = 0 as unknown as Table;
const a = new A(x);

///////////////////////////////////////////////////
// Meta instantiation
///////////////////////////////////////////////////
if (a.meta?.table) {
  expectTypeOf(new a.meta.table()).toEqualTypeOf<TableMeta>();
}

if (a.meta?.column) {
  expectTypeOf(new a.meta.column()).toEqualTypeOf<ColumnMeta>();
}

if (a.meta?.row) {
  expectTypeOf(new a.meta.row()).toEqualTypeOf<RowMeta>();
}
