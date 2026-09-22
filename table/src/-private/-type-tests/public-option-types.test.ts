import { expectTypeOf } from 'expect-type';

import type { CellContext, CellOptions, CellOptionsOf } from '../../index.ts';

interface Person {
  name: string;
}

// An app writing an `options` callback names what it must return.
const options = (_context: CellContext<Person>): CellOptions => ({
  defaultValue: '--',
  unit: 'years',
});

expectTypeOf(options).returns.toEqualTypeOf<CellOptions>();

// And code that takes what `getOptionsForRow` gives a Cell names that.
interface UnitCellArgs {
  options: { unit: string };
}

expectTypeOf<CellOptionsOf<UnitCellArgs>>().toEqualTypeOf<{ unit: string }>();
