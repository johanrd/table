import { meta } from '../-private/base.ts';
import { ColumnReordering } from './plugin.ts';

import type { ColumnOrder } from './plugin.ts';
import type { Column, Table } from '../../index.ts';

/**
 * Move the column one position to the left.
 * If the column is first, nothing will happen.
 */
export const moveLeft = <DataType = unknown>(column: Column<DataType>) =>
  meta.forColumn(column, ColumnReordering).moveLeft();

/**
 * Move the column one position to the right.
 * If the column is last, nothing will happen.
 */
export const moveRight = <DataType = unknown>(column: Column<DataType>) =>
  meta.forColumn(column, ColumnReordering).moveRight();

/**
 * Override all column positions at once.
 */
export const setColumnOrder = <DataType = unknown>(
  table: Table<DataType>,
  order: ColumnOrder,
) => meta.forTable(table, ColumnReordering).setOrder(order);

/**
 * Ask if the column cannot move to the left
 */
export const cannotMoveLeft = <DataType = unknown>(column: Column<DataType>) =>
  meta.forColumn(column, ColumnReordering).cannotMoveLeft;

/**
 * Ask if the column cannot move to the right
 */
export const cannotMoveRight = <DataType = unknown>(column: Column<DataType>) =>
  meta.forColumn(column, ColumnReordering).cannotMoveRight;

/**
 * Ask if the column can move to the left
 * (If your plugin doesn't expose `canMoveLeft`, use `!cannotMoveLeft`.)
 */
export const canMoveLeft = <DataType = unknown>(column: Column<DataType>) =>
  // Prefer this if available:
  // meta.forColumn(column, ColumnReordering).canMoveLeft
  !meta.forColumn(column, ColumnReordering).cannotMoveLeft;

/**
 * Ask if the column can move to the right
 * (If your plugin doesn't expose `canMoveRight`, use `!cannotMoveRight`.)
 */
export const canMoveRight = <DataType = unknown>(column: Column<DataType>) =>
  // Prefer this if available:
  // meta.forColumn(column, ColumnReordering).canMoveRight
  !meta.forColumn(column, ColumnReordering).cannotMoveRight;
