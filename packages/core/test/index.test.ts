import type { JsonNode } from '../src/type.ts'
import { describe, expect, it } from 'vitest'
import { createDocument } from '../src/document.ts'

describe('createDocument', () => {
  it('should auto-expand ancestors when a child is explicitly expanded', () => {
    const input = {
      scripts: {
        start: 'node index.js',
        build: 'tsc',
      },
      repository: {
        type: 'git',
        url: '...',
      },
    }

    const doc = createDocument(input, {
      expandedPaths: ['scripts'],
    })

    // The root node (path: '') should be automatically expanded
    // because its child 'scripts' is explicitly expanded.
    const rootNode = doc.nodes.find((n: JsonNode) => n.path === '')
    const scriptsNode = doc.nodes.find((n: JsonNode) => n.path === 'scripts')
    const repositoryNode = doc.nodes.find((n: JsonNode) => n.path === 'repository')

    expect(scriptsNode?.expanded).toBe(true)
    expect(rootNode?.expanded).toBe(true)
    // repository is not expanded and doesn't have an expanded child
    expect(repositoryNode?.expanded).toBe(false)
  })
})
