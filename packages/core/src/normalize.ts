import type { JsonArray, JsonInput, JsonObject, JsonValue } from './type.ts'
import { Decimal } from 'decimal.js'

const DECIMAL_MARKER = '__jsonupDecimal__'

/**
 * 将输入解析并规范化为 JSON 根对象或数组。
 * 如果输入是字符串，将安全地解析 JSON 字符串（大数将转换为 Decimal 类型）。
 *
 * @param input - JSON 字符串、对象或数组
 * @returns 规范化后的 JsonObject 或 JsonArray
 * @throws 当解析结果不是对象或数组时抛出错误
 */
export function toJsonRoot(input: JsonInput): JsonObject | JsonArray {
  const normalized = typeof input === 'string' ? parseJsonWithDecimal(input) : input
  const value = toJsonValue(normalized)

  if (!isContainerValue(value)) {
    throw new TypeError('JSON root must be an object or array.')
  }

  return value
}

/**
 * 将给定的值深度转换为合法的 JsonValue，支持 bigint 和 Decimal 转换。
 *
 * @param value - 要转换的任意值
 * @returns 规范化后的 JsonValue
 * @throws 当值无法被 JSON 序列化时抛出错误
 */
export function toJsonValue(value: unknown): JsonValue {
  if (
    value === null
    || typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
  ) {
    return value
  }

  if (typeof value === 'bigint') {
    return new Decimal(value.toString())
  }

  if (Decimal.isDecimal(value)) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(item => toJsonValue(item))
  }

  if (isPlainObject(value)) {
    const decimalValue = getDecimalMarkerValue(value)

    if (decimalValue !== undefined) {
      return new Decimal(decimalValue)
    }

    const result: JsonObject = {}

    for (const [key, item] of Object.entries(value)) {
      result[key] = toJsonValue(item)
    }

    return result
  }

  throw new TypeError('Value must be JSON serializable.')
}

/**
 * 判断给定的 JsonValue 是否为容器类型（对象或数组）。
 *
 * @param value - 要判断的 JsonValue
 * @returns 如果是对象或数组则返回 true
 */
export function isContainerValue(value: JsonValue): value is JsonObject | JsonArray {
  return value !== null && typeof value === 'object' && !Decimal.isDecimal(value)
}

/**
 * 判断给定的 JsonValue 是否为普通 JSON 对象。
 *
 * @param value - 要判断的 JsonValue
 * @returns 如果是普通对象则返回 true
 */
export function isJsonObject(value: JsonValue): value is JsonObject {
  return (
    value !== null
    && !Array.isArray(value)
    && typeof value === 'object'
    && !Decimal.isDecimal(value)
  )
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function parseJsonWithDecimal(input: string): unknown {
  return JSON.parse(rewriteUnsafeJsonNumbers(input))
}

function rewriteUnsafeJsonNumbers(input: string): string {
  let output = ''
  let index = 0
  let inString = false
  let escaping = false

  while (index < input.length) {
    const char = input[index]

    if (inString) {
      output += char

      if (escaping) {
        escaping = false
      } else if (char === '\\') {
        escaping = true
      } else if (char === '"') {
        inString = false
      }

      index += 1
      continue
    }

    if (char === '"') {
      inString = true
      output += char
      index += 1
      continue
    }

    if (char === '-' || isDigit(char)) {
      const numberToken = readJsonNumber(input, index)

      if (numberToken) {
        output += shouldParseAsDecimal(numberToken)
          ? `{"${DECIMAL_MARKER}":"${numberToken}"}`
          : numberToken
        index += numberToken.length
        continue
      }
    }

    output += char
    index += 1
  }

  return output
}

function readJsonNumber(input: string, start: number): string | undefined {
  let index = start

  if (input[index] === '-') {
    index += 1
  }

  if (input[index] === '0') {
    index += 1
  } else if (isDigitOneToNine(input[index])) {
    index += 1

    while (isDigit(input[index])) {
      index += 1
    }
  } else {
    return undefined
  }

  if (input[index] === '.') {
    index += 1

    if (!isDigit(input[index])) {
      return undefined
    }

    while (isDigit(input[index])) {
      index += 1
    }
  }

  if (input[index] === 'e' || input[index] === 'E') {
    index += 1

    if (input[index] === '+' || input[index] === '-') {
      index += 1
    }

    if (!isDigit(input[index])) {
      return undefined
    }

    while (isDigit(input[index])) {
      index += 1
    }
  }

  return input.slice(start, index)
}

function shouldParseAsDecimal(numberToken: string): boolean {
  if (/[.e]/i.test(numberToken)) {
    return true
  }

  const decimal = new Decimal(numberToken)

  return !decimal.isInteger() || decimal.abs().greaterThan(Number.MAX_SAFE_INTEGER)
}

function getDecimalMarkerValue(value: Record<string, unknown>): string | undefined {
  if (Object.keys(value).length !== 1) {
    return undefined
  }

  const decimalValue = value[DECIMAL_MARKER]

  return typeof decimalValue === 'string' ? decimalValue : undefined
}

function isDigit(value: string | undefined): boolean {
  return value !== undefined && value >= '0' && value <= '9'
}

function isDigitOneToNine(value: string | undefined): boolean {
  return value !== undefined && value >= '1' && value <= '9'
}
