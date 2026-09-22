import type { Column } from './column.ts';
import type { Table } from './table.ts';

/**
 * A column of any table, for code that reads a column without rendering its Cell.
 *
 * The args of a `Cell` are the args of a function, so a column that carries them
 * is not a column that carries none. Code that only reads `key`, `name` or `meta`
 * would have to name those args and then ignore them. This says "any args" instead.
 *
 * ```ts
 * function widthOf(column: AnyColumn<Person, ExportMeta>) {
 *   return column.meta?.width;
 * }
 * ```
 */
export type AnyColumn<T = unknown, ColumnMeta = unknown> = Column<
  T,
  ColumnMeta,
  any,
  any
>;

/**
 * A table of any shape, the counterpart of `AnyColumn`.
 */
export type AnyTable<T = unknown, ColumnMeta = unknown> = Table<
  T,
  ColumnMeta,
  any,
  any
>;
