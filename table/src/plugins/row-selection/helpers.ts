import { meta } from '../-private/base.ts';
import { RowSelection } from './plugin.ts';

import type { Row } from '../../-private/row.ts';

export const isSelected = (row: Row<any>) =>
  meta.forRow(row, RowSelection).isSelected;
export const select = (row: Row<any>) =>
  meta.forRow(row, RowSelection).select();
export const deselect = (row: Row<any>) =>
  meta.forRow(row, RowSelection).deselect();
export const toggle = (row: Row<any>) =>
  meta.forRow(row, RowSelection).toggle();
