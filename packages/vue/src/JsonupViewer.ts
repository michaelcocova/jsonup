import type { CreateDocumentOptions, JsonDocument, JsonInput, JsonNode, JsonNodeIdentity } from '@jsonup/core'
import type { JsonupTheme } from '@jsonup/themes'
import type { PropType, SlotsType, VNodeChild } from 'vue'
import type { JsonupViewerLine } from './viewer-lines.ts'
import {
  createDocument,
  getChildren,
  isJsonDocument,

} from '@jsonup/core'
import { useCssVars } from '@jsonup/themes'
import { Virtualizer } from 'virtua/vue'
import {
  computed,
  defineComponent,
  h,

  shallowRef,

  triggerRef,

  watch,
} from 'vue'
import { createViewerLines } from './viewer-lines.js'
import './style.less'

/**
 * 查看器行插槽的属性接口
 */
export interface JsonupViewerLineSlotProps {
  /** 当前行对象 */
  line: JsonupViewerLine
  /** 行的纯文本内容 */
  text: string
  /** 行号（从 1 开始） */
  lineNumber: number
  /** 切换节点展开/折叠状态的函数 */
  toggle: () => void
}

interface ViewerToken {
  text: string
  class: string | string[]
}

type QuoteTokenKind = 'key' | 'string'

/**
 * JSON 树形查看器组件
 */
export const JsonupViewer = defineComponent({
  name: 'JsonupViewer',
  props: {
    /** 传入的 JSON 数据或已创建的 JSON 文档对象 */
    data: {
      type: [String, Object, Array] as PropType<JsonInput | JsonDocument>,
      required: true,
    },
    /** 是否显示行号 */
    lineNumbers: {
      type: Boolean,
      default: false,
    },
    /** 是否开启虚拟滚动 */
    virtual: {
      type: Boolean,
      default: false,
    },
    /** 默认是否展开根节点 */
    defaultExpandedRoot: {
      type: Boolean,
      default: true,
    },
    /** 默认是否展开所有节点 */
    defaultExpandedAll: {
      type: Boolean,
      default: false,
    },
    /** 默认展开的深度 */
    defaultExpandedDepth: {
      type: [Number, Boolean] as PropType<number | true>,
      default: undefined,
    },
    /** 默认展开的节点路径集合 */
    expandedPaths: {
      type: [Array, Set] as PropType<Iterable<string>>,
      default: undefined,
    },
    /** 节点的身份标识树，用于保持节点状态 */
    identityTree: {
      type: Object as PropType<JsonNodeIdentity>,
      default: undefined,
    },
    /** 是否克隆原始数据（避免修改原对象） */
    cloneRaw: {
      type: Boolean,
      default: false,
    },
    /** 主题配置对象 */
    theme: {
      type: Object as PropType<JsonupTheme | null>,
      default: null,
    },
    /** 是否开启单词换行 */
    wordWrap: {
      type: Boolean,
      default: false,
    },
  },
  slots: Object as SlotsType<{
    /** 自定义所有类型行的渲染，优先级低于特定类型的插槽 */
    line?: (props: JsonupViewerLineSlotProps) => VNodeChild
    /** 自定义展开起始行的渲染 */
    open?: (props: JsonupViewerLineSlotProps) => VNodeChild
    /** 自定义属性行的渲染 */
    property?: (props: JsonupViewerLineSlotProps) => VNodeChild
    /** 自定义展开结束行的渲染 */
    close?: (props: JsonupViewerLineSlotProps) => VNodeChild
    /** 自定义折叠行的渲染 */
    collapsed?: (props: JsonupViewerLineSlotProps) => VNodeChild
    /** 自定义行号的渲染 */
    lineNumber?: (props: JsonupViewerLineSlotProps) => VNodeChild
  }>,
  setup(props, { slots }) {
    const document = shallowRef(
      createViewerDocument(props.data, {
        defaultExpandedRoot: props.defaultExpandedRoot,
        defaultExpandedAll: props.defaultExpandedAll,
        defaultExpandedDepth: props.defaultExpandedDepth,
        expandedPaths: props.expandedPaths,
        identityTree: props.identityTree,
        cloneRaw: props.cloneRaw,
      }),
    )

    watch(
      [
        () => props.data,
        () => props.defaultExpandedRoot,
        () => props.defaultExpandedAll,
        () => props.defaultExpandedDepth,
        () => props.expandedPaths,
        () => props.identityTree,
        () => props.cloneRaw,
      ],
      ([nextData, nextDefaultExpandedRoot, nextDefaultExpandedAll, nextDefaultExpandedDepth, nextExpandedPaths, nextIdentityTree, nextCloneRaw]) => {
        document.value = createViewerDocument(nextData, {
          defaultExpandedRoot: nextDefaultExpandedRoot as boolean,
          defaultExpandedAll: nextDefaultExpandedAll as boolean,
          defaultExpandedDepth: nextDefaultExpandedDepth as number | true | undefined,
          expandedPaths: nextExpandedPaths as Iterable<string> | undefined,
          identityTree: nextIdentityTree as JsonNodeIdentity | undefined,
          cloneRaw: nextCloneRaw as boolean,
        })
      },
      { deep: false },
    )

    const themeVars = computed(() => useCssVars(props.theme))
    const lines = computed(() => createViewerLines(document.value, document.value.visibleNodes))

    const renderLine = (line: JsonupViewerLine) => {
      const toggle = () => {
        if (!line.node.expandable) {
          return
        }

        document.value.toggleExpanded(line.node.id)
        triggerRef(document)
      }
      const slotProps: JsonupViewerLineSlotProps = {
        line,
        text: line.text,
        lineNumber: line.lineNumber,
        toggle,
      }
      const content
        = slots[line.kind]?.(slotProps)
          ?? slots.line?.(slotProps)
          ?? renderDefaultLine(document.value, line)

      return h(
        'div',
        {
          'key': line.id,
          'class': ['line', line.interactive ? 'interactive' : undefined],
          'data-state': line.kind,
          'data-type': line.node.type,
          'data-interactive': String(line.interactive),
          'role': 'treeitem',
          'aria-expanded': line.node.expandable ? String(line.node.expanded) : undefined,
          'style': {
            '--jsonup-viewer-line-depth': String(line.depth),
          },
          'onClick': line.interactive ? toggle : undefined,
        },
        [
          props.lineNumbers
            ? h(
                'span',
                {
                  class: ['line-number', 'meta', 'meta-line-number'],
                },
                slots.lineNumber?.(slotProps) ?? String(line.lineNumber),
              )
            : null,
          h(
            'span',
            {
              class: ['content', props?.wordWrap ? 'word-wrap' : undefined],
            },
            content,
          ),
        ],
      )
    }

    return () =>
      h(
        'div',
        {
          'class': [
            'jsonup-viewer',
            props.lineNumbers ? 'line-numbers' : undefined,
            props.virtual ? 'virtual' : undefined,
          ],
          'data-theme': props.theme?.name,
          'data-word-wrap': props.wordWrap ? 'on' : 'off',
          'data-theme-type': props.theme?.type,
          'role': 'tree',
          'style': themeVars.value,
        },
        props.virtual
          ? h(
              Virtualizer,
              { data: lines.value },
              { default: ({ item }: { item: JsonupViewerLine }) => renderLine(item) },
            )
          : lines.value.map(line => renderLine(line)),
      )
  },
})

function createViewerDocument(
  input: JsonInput | JsonDocument,
  options: CreateDocumentOptions,
): JsonDocument {
  if (isJsonDocument(input)) {
    return input
  }

  return createDocument(input, options)
}

function renderDefaultLine(document: JsonDocument, line: JsonupViewerLine): VNodeChild[] {
  return createLineTokens(document, line).map((token, index) =>
    h(
      'span',
      {
        key: `${line.id}:${index}:${token.text}`,
        class: token.class,
      },
      token.text,
    ),
  )
}

function createLineTokens(document: JsonDocument, line: JsonupViewerLine): ViewerToken[] {
  switch (line.kind) {
    case 'open':
      return [
        ...createKeyTokens(line.node),
        createBracketToken(line.node.type === 'array' ? '[' : '{', getContainerType(line.node)),
      ]
    case 'close':
      return appendCommaToken(
        [createBracketToken(line.node.type === 'array' ? ']' : '}', getContainerType(line.node))],
        hasNextSibling(document, line.node),
      )
    case 'collapsed':
      return [
        ...createKeyTokens(line.node),
        createBracketToken(line.node.type === 'array' ? '[' : '{', getContainerType(line.node)),
        {
          text:
            line.node.type === 'array'
              ? ` ${line.node.children} items `
              : ` ${line.node.children} keys `,
          class: ['summary', 'meta', 'meta-summary'],
        },
        createBracketToken(line.node.type === 'array' ? ']' : '}', getContainerType(line.node)),
      ]
    case 'property':
      return appendCommaToken(
        [...createKeyTokens(line.node), ...createValueTokens(line.node)],
        hasNextSibling(document, line.node),
      )
    default:
      return [{ text: line.text, class: 'text' }]
  }
}

function createKeyTokens(node: JsonNode): ViewerToken[] {
  if (node.depth === 0 || node.key === undefined) {
    return []
  }

  if (node.parent !== null && /^\d+$/.test(node.key)) {
    return []
  }

  return [
    createQuoteToken('key'),
    {
      text: stringifyInner(node.key),
      class: 'key',
    },
    createQuoteToken('key'),
    {
      text: ': ',
      class: ['colon', 'punctuation'],
    },
  ]
}

function createValueTokens(node: JsonNode): ViewerToken[] {
  switch (node.type) {
    case 'string':
      return [
        createQuoteToken('string'),
        {
          text: stringifyInner((node.value as string) ?? ''),
          class: ['value', 'string'],
        },
        createQuoteToken('string'),
      ]
    case 'number':
      return [
        {
          text: String((node.value as number) ?? 0),
          class: ['value', 'number'],
        },
      ]
    case 'boolean':
      return [
        {
          text: String((node.value as boolean) ?? false),
          class: ['value', 'boolean'],
        },
      ]
    case 'null':
      return [
        {
          text: 'null',
          class: ['value', 'null'],
        },
      ]
    case 'array':
      return [createBracketToken('[]', 'array')]
    case 'object':
      return [createBracketToken('{}', 'object')]
    default:
      return []
  }
}

function appendCommaToken(tokens: ViewerToken[], hasComma: boolean): ViewerToken[] {
  if (!hasComma) {
    return tokens
  }

  return [...tokens, { text: ',', class: ['comma', 'punctuation'] }]
}

function createQuoteToken(kind: QuoteTokenKind): ViewerToken {
  return {
    text: '"',
    class: ['quote', `${kind}-quote`, 'punctuation', 'quote-token', kind],
  }
}

function createBracketToken(text: string, type: 'object' | 'array'): ViewerToken {
  return {
    text,
    class: ['symbol', 'punctuation', 'bracket', 'storage', type],
  }
}

function getContainerType(node: JsonNode): 'object' | 'array' {
  return node.type === 'array' ? 'array' : 'object'
}

function stringifyInner(value: string): string {
  const encoded = JSON.stringify(value)
  return encoded.slice(1, -1)
}

function hasNextSibling(document: JsonDocument, node: JsonNode): boolean {
  if (node.parent === null) {
    return false
  }

  const siblings = getChildren(document, node.parent)
  return siblings[siblings.length - 1]?.id !== node.id
}
