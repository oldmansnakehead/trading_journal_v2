import { describe, it, expect } from 'vitest'
import { PLAYBOOK_TEMPLATES } from './templates'

describe('Playbook Templates', () => {
  it('should provide default strategy templates', () => {
    expect(PLAYBOOK_TEMPLATES.length).toBeGreaterThanOrEqual(2)
    const smc = PLAYBOOK_TEMPLATES.find((t) => t.id === 'smc_ict')
    const breakout = PLAYBOOK_TEMPLATES.find((t) => t.id === 'breakout_retest')

    expect(smc).toBeDefined()
    expect(breakout).toBeDefined()
  })

  it('each template should have properly structured nodes with valid types', () => {
    const validNodeTypes = [
      'contextBias',
      'conditionFilter',
      'decisionBranch',
      'entryTrigger',
      'riskInvalidation'
    ]

    for (const tpl of PLAYBOOK_TEMPLATES) {
      expect(tpl.nodes.length).toBeGreaterThanOrEqual(3)
      for (const node of tpl.nodes) {
        expect(validNodeTypes).toContain(node.type)
        expect(node.id).toBeDefined()
        expect(node.position).toBeDefined()
        expect(node.data).toBeDefined()
        expect(node.data.title).toBeTruthy()
      }
    }
  })

  it('each edge should connect valid node IDs within the template', () => {
    for (const tpl of PLAYBOOK_TEMPLATES) {
      const nodeIds = new Set(tpl.nodes.map((n) => n.id))

      for (const edge of tpl.edges) {
        expect(nodeIds.has(edge.source)).toBe(true)
        expect(nodeIds.has(edge.target)).toBe(true)
      }
    }
  })

  it('decision branch nodes should connect cleanly with yes branch handles', () => {
    const smc = PLAYBOOK_TEMPLATES.find((t) => t.id === 'smc_ict')!
    const decisionEdge = smc.edges.find((e) => e.source === 'node-3')

    expect(decisionEdge).toBeDefined()
    expect(decisionEdge?.sourceHandle).toBe('yes')
    expect(decisionEdge?.target).toBe('node-4')
  })
})
