import { setComponentTemplate } from '@ember/component';
import { assert } from '@ember/debug';
import { htmlSafe } from '@ember/template';
import { findAll, render } from '@ember/test-helpers';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import * as QUnit from 'qunit';
import { module, test } from 'qunit';

import { headlessTable } from '@crowdstrike/ember-headless-table';
import {
  ColumnResizing,
  resizeHandle,
} from '@crowdstrike/ember-headless-table/plugins/column-resizing';
import { ColumnVisibility } from '@crowdstrike/ember-headless-table/plugins/column-visibility';
import { createHelpers } from '@crowdstrike/ember-headless-table/test-support';

type Changes = Array<{ value: () => number; by: number; msg?: string }>;

module('Plugins | resizing', function (hooks) {
  setupRenderingTest(hooks);

  /**
   * In order for this work nicely with clean, non-decimal values, we must:
   *  - box-sizing: borderbox everywhere
   *  - on the table: border-collapse: collapse;
   *  - no border styling around cells
   *  - bax shadows are fine (for testing where column boundaries are (for humans))
   */
  async function assertChanges(block: () => Promise<void> | void, changes: Changes) {
    let initialValues = changes.map((change) => change.value());

    await block();

    for (let [key, change] of Object.entries(changes)) {
      let index = parseInt(key, 10);
      let actual = change.value();
      let expected = initialValues[index] + change.by;

      // Uncomment this to debuge flaky resize behavior!
      // if (actual !== expected) {
      //   console.log({ key, actual, expected, by: change.by, initially: initialValues[index] });
      //   await pauseTest();
      // }

      QUnit.assert.strictEqual(actual, expected, change.msg);
    }
  }

  let renderWithoutScaling: (comp?: unknown) => Promise<void>;
  let ctx: Context;
  let getColumns = () => {
    let ths = findAll('th');

    return ths;
  };

  let { dragLeft, dragRight } = createHelpers({ resizeHandle: '[data-handle]' });

  function width(element: Element) {
    return element.getBoundingClientRect().width;
  }

  function roomToShrink(element: Element) {
    assert('element must be an HTML element', element instanceof HTMLElement);

    let minWidth = parseInt(element.style.minWidth.replace('px', ''), 10) || 0;

    return width(element) - minWidth;
  }

  class Context {
    @tracked containerWidth = 1000;

    columns = [
      { name: 'A', key: 'A' },
      { name: 'B', key: 'B' },
      { name: 'C', key: 'C' },
      { name: 'D', key: 'D' },
    ];

    setContainerWidth = async (width: number) => {
      this.containerWidth = width;
      await new Promise((resolve) => requestAnimationFrame(resolve));
    };

    table = headlessTable(this, {
      columns: () => this.columns,
      data: () => [],
      plugins: [ColumnResizing],
    });
  }

  class TestComponentA extends Component<{ ctx: Context }> {
    resizeHandle = resizeHandle;

    get table() {
      return this.args.ctx.table;
    }

    get modifiers() {
      return this.table.modifiers;
    }

    get testContainerStyle() {
      return htmlSafe(`width: ${this.args.ctx.containerWidth}px`);
    }
  }

  setComponentTemplate(
    hbs`
      {{!-- template-lint-disable no-forbidden-elements --}}
      <style>
        [data-handle] {
          cursor: ew-resize;
          display: inline-block;
          position: absolute;
          left: -0.3rem;
          width: 1rem;
          text-align: center;
        }

        th:first-child [data-handle] {
          display: none;
        }

        [data-scroll-container] {
          height: 100%;
          overflow: auto;
        }

        * {
          box-sizing: border-box;
        }

        table {
          border-collapse: collapse;
        }

        th {
          position: relative;
          box-shadow: inset 1px 0px 0px rgb(0 0 0 / 50%);
        }
      </style>
      {{!-- template-lint-disable no-inline-styles --}}
      {{!-- template-lint-disable style-concatenation --}}
      <div data-container style={{this.testContainerStyle}}>
        <div data-scroll-container {{this.modifiers.container}}>
          <table>
            <thead>
              <tr>
                {{#each this.table.visibleColumns as |column|}}
                  <th {{this.modifiers.columnHeader column}}>
                    <span>{{column.name}}</span>

                    <div data-handle {{this.resizeHandle column}}>|</div>
                  </th>
                {{/each}}
              </tr>
            </thead>
          </table>
        </div>
      </div>
    `,
    TestComponentA,
  );

  class TestComponentB extends Component<{ ctx: Context }> {
    resizeHandle = resizeHandle;

    get table() {
      return this.args.ctx.table;
    }

    get modifiers() {
      return this.table.modifiers;
    }

    get testContainerStyle() {
      return htmlSafe(`width: ${this.args.ctx.containerWidth}px`);
    }
  }

  setComponentTemplate(
    hbs`
      {{!-- template-lint-disable no-forbidden-elements --}}
      <style>
        [data-handle] {
          cursor: ew-resize;
          display: inline-block;
          position: absolute;
          right: -0.3rem;
          width: 1rem;
          text-align: center;
        }

        th:last-child [data-handle] {
          display: none;
        }

        [data-scroll-container] {
          height: 100%;
          overflow: auto;
        }

        * {
          box-sizing: border-box;
        }

        table {
          border-collapse: collapse;
        }

        th {
          position: relative;
          box-shadow: inset 1px 0px 0px rgb(0 0 0 / 50%);
        }
      </style>
      {{!-- template-lint-disable no-inline-styles --}}
      {{!-- template-lint-disable style-concatenation --}}
      <div data-container style={{this.testContainerStyle}}>
        <div data-scroll-container {{this.modifiers.container}}>
          <table>
            <thead>
              <tr>
                {{#each this.table.visibleColumns as |column|}}
                  <th {{this.modifiers.columnHeader column}}>
                    <span>{{column.name}}</span>

                    <div data-handle {{this.resizeHandle column}}>|</div>
                  </th>
                {{/each}}
              </tr>
            </thead>
          </table>
        </div>
      </div>
    `,
    TestComponentB,
  );

  hooks.beforeEach(function () {
    ctx = new Context();

    renderWithoutScaling = async (comp = TestComponentA) => {
      this.setProperties({ comp, ctx });

      // This removes some styling that is put on the testing container that
      // interferes with the tests used in this module.  Mainly, the testing
      // container has a transform: scale(0.5); by default that makes it
      // difficult to write these tests in a way that makes sense because
      // everything needs to be cut in half to account for it.
      //
      // See https://github.com/emberjs/ember-qunit/issues/521
      await render(hbs`
        {{!-- template-lint-disable no-forbidden-elements --}}
        <style>
          #ember-testing { width: initial; height: initial; transform: initial; }
        </style>

        <this.comp @ctx={{this.ctx}} />
      `);
    };
  });

  module('with no options specified', function (hooks) {
    class DefaultOptions extends Context {
      table = headlessTable(this, {
        columns: () => this.columns,
        data: () => [],
        plugins: [ColumnResizing, ColumnVisibility],
      });
    }

    hooks.beforeEach(function () {
      ctx = new DefaultOptions();
    });

    test('it resizes each column', async function () {
      ctx.setContainerWidth(1000);
      await renderWithoutScaling();

      let [columnA, columnB, columnC, columnD] = getColumns();

      await assertChanges(
        () => dragRight(columnB, 50),
        [
          { value: () => width(columnA), by: 50, msg: 'width of A increased by 50' },
          { value: () => width(columnB), by: -50, msg: 'width of B decreased by 50' },
          { value: () => width(columnC), by: 0, msg: 'width of C unchanged' },
          { value: () => width(columnD), by: 0, msg: 'width of D unchanged' },
        ],
      );

      await assertChanges(
        () => dragLeft(columnB, 10),
        [
          { value: () => width(columnA), by: -10, msg: 'width of A decreased by 10-' },
          { value: () => width(columnB), by: 10, msg: 'width of B increased by 10' },
          { value: () => width(columnC), by: 0, msg: 'width of C unchanged' },
          { value: () => width(columnD), by: 0, msg: 'width of D unchanged' },
        ],
      );
    });
  });

  module('with options that affect resize behavior', function () {
    module('handlePosition (default)', function () {
      test('it works', async function () {
        ctx.setContainerWidth(1000);
        await renderWithoutScaling();

        let [columnA, columnB, columnC, columnD] = getColumns();

        await assertChanges(
          () => dragRight(columnB, 50),
          [
            { value: () => width(columnA), by: 50, msg: 'width of A increased by 50' },
            { value: () => width(columnB), by: -50, msg: 'width of B decreased by 50' },
            { value: () => width(columnC), by: 0, msg: 'width of C unchanged' },
            { value: () => width(columnD), by: 0, msg: 'width of D unchanged' },
          ],
        );

        await assertChanges(
          () => dragLeft(columnB, 10),
          [
            { value: () => width(columnA), by: -10, msg: 'width of A decreased by 10-' },
            { value: () => width(columnB), by: 10, msg: 'width of B increased by 10' },
            { value: () => width(columnC), by: 0, msg: 'width of C unchanged' },
            { value: () => width(columnD), by: 0, msg: 'width of D unchanged' },
          ],
        );
      });

      test('column resizing respects column minWidth', async function () {
        ctx.setContainerWidth(1000);
        await renderWithoutScaling();

        let [columnA, columnB, columnC, columnD] = getColumns();

        // This will grow columnA by more than columnB can shrink, which should
        // cause columnB to shrink to it's minimum width and then shrink the next
        // column by the remainder.
        let delta = roomToShrink(columnB) + 50;

        await assertChanges(
          () => dragRight(columnB, delta),
          [
            { value: () => width(columnA), by: delta, msg: 'width of A increased by delta' },
            {
              value: () => width(columnB),
              by: -roomToShrink(columnB),
              msg: 'width of B decreased to min width',
            },
            { value: () => width(columnC), by: -50, msg: 'width of C decreased by remainder' },
            { value: () => width(columnD), by: 0, msg: 'width of D unchanged' },
          ],
        );
      });

      test('table & columns resize to fit containing element', async function () {
        ctx.setContainerWidth(1000);
        await renderWithoutScaling();

        let [columnA, columnB, columnC, columnD] = getColumns();

        // When the container grows, columns grow equally
        await assertChanges(
          () => ctx.setContainerWidth(ctx.containerWidth + 4000),
          [
            { value: () => width(columnA), by: 1000, msg: 'width of A increased by 1000' },
            { value: () => width(columnB), by: 1000, msg: 'width of B increased by 1000' },
            { value: () => width(columnC), by: 1000, msg: 'width of C increased by 1000' },
            { value: () => width(columnD), by: 1000, msg: 'width of D increased by 1000' },
          ],
        );

        // When the container shrinks, columns shrink equally
        await assertChanges(
          () => ctx.setContainerWidth(ctx.containerWidth - 2000),
          [
            { value: () => width(columnA), by: -500, msg: 'width of A decreased by 500' },
            { value: () => width(columnB), by: -500, msg: 'width of B decreased by 500' },
            { value: () => width(columnC), by: -500, msg: 'width of C decreased by 500' },
            { value: () => width(columnD), by: -500, msg: 'width of D decreased by 500' },
          ],
        );
      });

      test('table resizing respects resized columns', async function () {
        ctx.setContainerWidth(1000);
        await renderWithoutScaling();

        let [columnA, columnB, columnC, columnD] = getColumns();

        // Resize a column
        await assertChanges(
          () => dragRight(columnB, 50),
          [
            { value: () => width(columnA), by: 50, msg: 'width of A increased by 50' },
            { value: () => width(columnB), by: -50, msg: 'width of B decreased by 50' },
            { value: () => width(columnC), by: 0, msg: 'width of C unchanged' },
            { value: () => width(columnD), by: 0, msg: 'width of D unchanged' },
          ],
        );

        // When the container grows by 1000, each column grows by 250
        await assertChanges(
          () => ctx.setContainerWidth(ctx.containerWidth + 1000),
          [
            { value: () => width(columnA), by: 250, msg: 'width of A increased by 250' },
            { value: () => width(columnB), by: 250, msg: 'width of B increased by 250' },
            { value: () => width(columnC), by: 250, msg: 'width of C increased by 250' },
            { value: () => width(columnD), by: 250, msg: 'width of D increased by 250' },
          ],
        );

        // When the container shrinks by 1000, each column shrinks by 250
        await assertChanges(
          () => ctx.setContainerWidth(ctx.containerWidth - 1000),
          [
            { value: () => width(columnA), by: -250, msg: 'width of A decreased by 250' },
            { value: () => width(columnB), by: -250, msg: 'width of B decreased by 250' },
            { value: () => width(columnC), by: -250, msg: 'width of C decreased by 250' },
            { value: () => width(columnD), by: -250, msg: 'width of D decreased by 250' },
          ],
        );
      });
    });

    module('handlePosition: right', function (hooks) {
      class HandlePositionRight extends Context {
        table = headlessTable(this, {
          columns: () => this.columns,
          data: () => [],
          plugins: [ColumnVisibility, ColumnResizing.with(() => ({ handlePosition: 'right' }))],
        });
      }

      hooks.beforeEach(function () {
        ctx = new HandlePositionRight();
      });

      test('it works', async function () {
        ctx.setContainerWidth(1000);
        await renderWithoutScaling(TestComponentB);

        let [columnA, columnB, columnC, columnD] = getColumns();

        await assertChanges(
          () => dragRight(columnB, 50),
          [
            { value: () => width(columnA), by: 50, msg: 'width of A increased by 50' },
            { value: () => width(columnB), by: -50, msg: 'width of B decreased by 50' },
            { value: () => width(columnC), by: 0, msg: 'width of C unchanged' },
            { value: () => width(columnD), by: 0, msg: 'width of D unchanged' },
          ],
        );

        await assertChanges(
          () => dragLeft(columnB, 10),
          [
            { value: () => width(columnA), by: -10, msg: 'width of A decreased by 10-' },
            { value: () => width(columnB), by: 10, msg: 'width of B increased by 10' },
            { value: () => width(columnC), by: 0, msg: 'width of C unchanged' },
            { value: () => width(columnD), by: 0, msg: 'width of D unchanged' },
          ],
        );
      });
    });
  });
});
