import { extend } from '@vue/shared'
import {
  baseParse as parse,
  transform,
  ElementNode,
  ObjectExpression,
  CompilerOptions,
  ErrorCodes,
  VNodeCall,
  CallExpression,
  NodeTypes,
  CAMELIZE,
  helperNameMap,
  NORMALIZE_PROPS,
  transformElement,
} from '@vue/compiler-core'
import { transformBind } from '../../src/plugins/uvue/compiler/transforms/vBind'
import { transformExpression } from '../../src/plugins/uvue/compiler/transforms/transformExpression'
import { assert } from '../testUtils'

function parseWithVBind(
  template: string,
  options: CompilerOptions = {}
): ElementNode {
  const ast = parse(template)
  transform(
    ast,
    extend({}, options, {
      prefixIdentifiers: options.prefixIdentifiers,
      nodeTransforms: [
        transformExpression,
        transformElement,
        ...(options.nodeTransforms || []), // user transforms
      ],
      directiveTransforms: extend(
        {},
        { bind: transformBind },
        options.directiveTransforms || {} // user transforms
      ),
    })
  )
  return ast.children[0] as ElementNode
}

describe('compiler: v-bind', () => {
  test('basic', () => {
    assert(
      `<view v-bind:id="id"/>`,
      `createElementVNode("view", new Map<string, any | null>([["id", _ctx.id]]), null, 8 /* PROPS */, ["id"])`
    )
  })
  test('dynamic arg', () => {
    assert(
      `<view v-bind:[id]="id"/>`,
      `createElementVNode("view", normalizeProps(new Map<string, any | null>([[_ctx.id !== null ? _ctx.id : \"\", _ctx.id]])), null, 16 /* FULL_PROPS */)`
    )
  })
  test('.camel modifier', () => {
    assert(
      `<view v-bind:foo-bar.camel="id"/>`,
      `createElementVNode(\"view\", new Map<string, any | null>([[\"fooBar\", _ctx.id]]), null, 8 /* PROPS */, [\"fooBar\"])`
    )
  })
  test('.camel modifier w/ dynamic arg', () => {
    assert(
      `<view v-bind:[foo].camel="id"/>`,
      `createElementVNode(\"view\", normalizeProps(new Map<string, any | null>([[camelize(_ctx.foo !== null ? _ctx.foo : \"\"), _ctx.id]])), null, 16 /* FULL_PROPS */)`
    )
  })
  test('.prop modifier', () => {
    assert(
      `<view v-bind:className.prop="className"/>`,
      `createElementVNode(\"view\", new Map<string, any | null>([[\".className\", _ctx.className]]), null, 8 /* PROPS */, [\".className\"])`
    )
  })
  test('.prop modifier w/ dynamic arg', () => {
    assert(
      `<view v-bind:[fooBar].prop="className"/>`,
      'createElementVNode("view", normalizeProps(new Map<string, any | null>([[`.${_ctx.fooBar !== null ? _ctx.fooBar : ""}`, _ctx.className]])), null, 16 /* FULL_PROPS */)'
    )
  })
  test('.prop modifier (shorthand)', () => {
    assert(
      `<view .className="className"/>`,
      'createElementVNode("view", new Map<string, any | null>([[".className", _ctx.className]]), null, 8 /* PROPS */, [".className"])'
    )
  })
  test('.attr modifier', () => {
    assert(
      `<view v-bind:foo-bar.attr="id"/>`,
      'createElementVNode("view", new Map<string, any | null>([["^foo-bar", _ctx.id]]), null, 8 /* PROPS */, ["^foo-bar"])'
    )
  })
  test('simple expression', () => {
    assert(
      `<view v-bind:class="{'box': true}"></view>`,
      `createElementVNode("view", new Map<string, any | null>([
  ["class", normalizeClass(new Map<string, any | null>([['box', true]]))]
]))`
    )
  })
  test('simple expression with array', () => {
    assert(
      `<view v-bind:class="[classA, {classB: true, classC: false}]"></view>`,
      `createElementVNode("view", new Map<string, any | null>([
  ["class", normalizeClass([_ctx.classA, new Map<string, any | null>([[classB, true], [classC, false]])])]
]), null, 2 /* CLASS */)`
    )
  })
  test('simple expression with object', () => {
    assert(
      `<view :style="{color: true ? 'blue' : 'red'}"></view>`,
      "createElementVNode(\"view\", new Map<string, any | null>([[\"style\", new Map<string, any | null>([['color', true ? 'blue' : 'red']])]]))"
    )
  })
  test('complex expression', () => {
    assert(
      `<rich-text :nodes="[{'name':'div','attrs':{'class':'div-class','style':'line-height: 60px; color: red; text-align:center;'},'children':[{'type':'text','text':'this is text'}]}]" />`,
      `createElementVNode(\"rich-text\", new Map<string, any | null>([[\"nodes\", [new Map<string, any | null>([['name', 'div'], ['attrs', new Map<string, any | null>([['class', 'div-class'], ['style', 'line-height: 60px; color: red; text-align:center;']])], ['children', [new Map<string, any | null>([['type', 'text'], ['text', 'this is text']])]]])]]]))`
    )
  })
  test('empty object syntax with \n', () => {
    assert(
      `<rich-text
  :nodes="[
    {
      'name': 'div',
      'attrs': {
        'class': 'div-class',
        'style': 'line-height: 60px; color: red; text-align:center;'
      },
      'children': [
        { 'type': 'text', 'text': 'this is text' },
        { 'type': 'text', 'text': 'this is text' },
      ]
    }
  ]"
/>`,
      "createElementVNode(\"rich-text\", new Map<string, any | null>([[\"nodes\", [    new Map<string, any | null>([['name', 'div'], ['attrs', new Map<string, any | null>([['class', 'div-class'], ['style', 'line-height: 60px; color: red; text-align:center;']])], ['children', [new Map<string, any | null>([['type', 'text'], ['text', 'this is text']]), new Map<string, any | null>([['type', 'text'], ['text', 'this is text']])]]])  ]]]))"
    )
  })
  test('style with empty {\n }', () => {
    assert(
      `<text :style="{
    }" />`,
      `createElementVNode(\"text\", new Map<string, any | null>([[\"style\", new Map<string, any | null>()]]))`
    )
  })
  test('object value width expression', () => {
    assert(
      `<view class="search" @click="toSearchPage" :style="{'width':700 +'rpx',
      'top':0 +'px'}" />`,
      `createElementVNode(\"view\", new Map<string, any | null>([
  [\"class\", \"search\"],
  [\"onClick\", _ctx.toSearchPage],
  [\"style\", new Map<string, any | null>([['width', 700 +'rpx'], ['top', 0 +'px']])]
]), null, 8 /* PROPS */, [\"onClick\"])`
    )
  })
  test('style with object complex expression', () => {
    assert(
      `<view :style="{'opcity': 1 - (scrollTop*3>100?100:scrollTop*3)/100}"></view>`,
      `createElementVNode(\"view\", new Map<string, any | null>([
  [\"style\", new Map<string, any | null>([['opcity', '1 - (_ctx.scrollTop*3>100?100:_ctx.scrollTop*3)/100']])]
]))`
    )
  })

  test('basic', () => {
    const node = parseWithVBind(`<view v-bind:id="id"/>`)
    const props = (node.codegenNode as VNodeCall).props as ObjectExpression
    expect(props.properties[0]).toMatchObject({
      key: {
        content: `id`,
        isStatic: true,
        loc: {
          start: {
            line: 1,
            column: 14,
          },
          end: {
            line: 1,
            column: 16,
          },
        },
      },
      value: {
        content: `id`,
        isStatic: false,
        loc: {
          start: {
            line: 1,
            column: 18,
          },
          end: {
            line: 1,
            column: 20,
          },
        },
      },
    })
  })

  test('dynamic arg', () => {
    const node = parseWithVBind(`<view v-bind:[id]="id"/>`)
    const props = (node.codegenNode as VNodeCall).props as CallExpression
    expect(props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: NORMALIZE_PROPS,
      arguments: [
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          properties: [
            {
              key: {
                content: `id !== null ? id : ""`,
                isStatic: false,
              },
              value: {
                content: `id`,
                isStatic: false,
              },
            },
          ],
        },
      ],
    })
  })

  test('should error if no expression', () => {
    const onError = jest.fn()
    const node = parseWithVBind(`<view v-bind:arg />`, { onError })
    const props = (node.codegenNode as VNodeCall).props as ObjectExpression
    expect(onError.mock.calls[0][0]).toMatchObject({
      code: ErrorCodes.X_V_BIND_NO_EXPRESSION,
      loc: {
        start: {
          line: 1,
          column: 7,
        },
        end: {
          line: 1,
          column: 17,
        },
      },
    })
    expect(props.properties[0]).toMatchObject({
      key: {
        content: `arg`,
        isStatic: true,
      },
      value: {
        content: ``,
        isStatic: true,
      },
    })
  })

  test('.camel modifier', () => {
    const node = parseWithVBind(`<view v-bind:foo-bar.camel="id"/>`)
    const props = (node.codegenNode as VNodeCall).props as ObjectExpression
    expect(props.properties[0]).toMatchObject({
      key: {
        content: `fooBar`,
        isStatic: true,
      },
      value: {
        content: `id`,
        isStatic: false,
      },
    })
  })

  test('.camel modifier w/ dynamic arg', () => {
    const node = parseWithVBind(`<view v-bind:[foo].camel="id"/>`)
    const props = (node.codegenNode as VNodeCall).props as CallExpression
    expect(props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: NORMALIZE_PROPS,
      arguments: [
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          properties: [
            {
              key: {
                content: `_${helperNameMap[CAMELIZE]}(foo !== null ? foo : "")`,
                isStatic: false,
              },
              value: {
                content: `id`,
                isStatic: false,
              },
            },
          ],
        },
      ],
    })
  })

  test('.camel modifier w/ dynamic arg + prefixIdentifiers', () => {
    const node = parseWithVBind(`<view v-bind:[foo(bar)].camel="id"/>`, {
      prefixIdentifiers: true,
    })
    const props = (node.codegenNode as VNodeCall).props as CallExpression
    expect(props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: NORMALIZE_PROPS,
      arguments: [
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          properties: [
            {
              key: {
                children: [
                  `_${helperNameMap[CAMELIZE]}(`,
                  `(`,
                  { content: `_ctx.foo` },
                  `(`,
                  { content: `_ctx.bar` },
                  `)`,
                  `) || ""`,
                  `)`,
                ],
              },
              value: {
                content: `_ctx.id`,
                isStatic: false,
              },
            },
          ],
        },
      ],
    })
  })

  test('.prop modifier', () => {
    const node = parseWithVBind(`<view v-bind:fooBar.prop="id"/>`)
    const props = (node.codegenNode as VNodeCall).props as ObjectExpression
    expect(props.properties[0]).toMatchObject({
      key: {
        content: `.fooBar`,
        isStatic: true,
      },
      value: {
        content: `id`,
        isStatic: false,
      },
    })
  })

  test('.prop modifier w/ dynamic arg', () => {
    const node = parseWithVBind(`<view v-bind:[fooBar].prop="id"/>`)
    const props = (node.codegenNode as VNodeCall).props as CallExpression
    expect(props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: NORMALIZE_PROPS,
      arguments: [
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          properties: [
            {
              key: {
                content: '`.${fooBar !== null ? fooBar : ""}`',
                isStatic: false,
              },
              value: {
                content: `id`,
                isStatic: false,
              },
            },
          ],
        },
      ],
    })
  })

  test('.prop modifier w/ dynamic arg + prefixIdentifiers', () => {
    const node = parseWithVBind(`<view v-bind:[foo(bar)].prop="id"/>`, {
      prefixIdentifiers: true,
    })
    const props = (node.codegenNode as VNodeCall).props as CallExpression
    expect(props).toMatchObject({
      type: NodeTypes.JS_CALL_EXPRESSION,
      callee: NORMALIZE_PROPS,
      arguments: [
        {
          type: NodeTypes.JS_OBJECT_EXPRESSION,
          properties: [
            {
              key: {
                children: [
                  `'.' + (`,
                  `(`,
                  { content: `_ctx.foo` },
                  `(`,
                  { content: `_ctx.bar` },
                  `)`,
                  `) || ""`,
                  `)`,
                ],
              },
              value: {
                content: `_ctx.id`,
                isStatic: false,
              },
            },
          ],
        },
      ],
    })
  })

  test('.prop modifier (shorthand)', () => {
    const node = parseWithVBind(`<view .fooBar="id"/>`)
    const props = (node.codegenNode as VNodeCall).props as ObjectExpression
    expect(props.properties[0]).toMatchObject({
      key: {
        content: `.fooBar`,
        isStatic: true,
      },
      value: {
        content: `id`,
        isStatic: false,
      },
    })
  })

  test('.attr modifier', () => {
    const node = parseWithVBind(`<view v-bind:foo-bar.attr="id"/>`)
    const props = (node.codegenNode as VNodeCall).props as ObjectExpression
    expect(props.properties[0]).toMatchObject({
      key: {
        content: `^foo-bar`,
        isStatic: true,
      },
      value: {
        content: `id`,
        isStatic: false,
      },
    })
  })
})
