import { describe, it, expect } from 'vitest'
import { AVAILABLE_NODE_TYPES, createInitialDataForType } from './nodeTypes'

describe('Playbook Node Types & Factory', () => {
  it('should define all 5 core trading node types', () => {
    expect(AVAILABLE_NODE_TYPES.length).toBe(5)
    const types = AVAILABLE_NODE_TYPES.map((n) => n.type)
    expect(types).toEqual([
      'contextBias',
      'conditionFilter',
      'decisionBranch',
      'entryTrigger',
      'riskInvalidation'
    ])
  })

  it('each node type should have complete metadata for draggable buttons', () => {
    for (const item of AVAILABLE_NODE_TYPES) {
      expect(item.type).toBeTruthy()
      expect(item.label).toBeTruthy()
      expect(item.fullName).toBeTruthy()
      expect(item.description).toBeTruthy()
      expect(item.colorClass).toBeTruthy()
      expect(item.bgClass).toBeTruthy()
      expect(item.borderClass).toBeTruthy()
      expect(item.dotClass).toBeTruthy()
    }
  })

  it('createInitialDataForType should produce correct defaults for each type', () => {
    const contextData = createInitialDataForType('contextBias')
    expect(contextData.title).toBe('Market Bias & Context')
    expect(contextData.bias).toBe('Bullish')
    expect(contextData.timeframe).toBe('1H')

    const conditionData = createInitialDataForType('conditionFilter')
    expect(conditionData.title).toBe('Key Condition')
    expect(conditionData.isMandatory).toBe(true)

    const decisionData = createInitialDataForType('decisionBranch')
    expect(decisionData.title).toBe('Validation Decision')
    expect(decisionData.yesLabel).toBe('Yes -> Enter')
    expect(decisionData.noLabel).toBe('No -> Abort')

    const triggerData = createInitialDataForType('entryTrigger')
    expect(triggerData.title).toBe('Execution Trigger')
    expect(triggerData.orderType).toBe('Market')

    const riskData = createInitialDataForType('riskInvalidation')
    expect(riskData.title).toBe('Risk & Invalidation')
    expect(riskData.targetRr).toBe('3.0R')
    expect(riskData.slRule).toBeDefined()
  })
})
