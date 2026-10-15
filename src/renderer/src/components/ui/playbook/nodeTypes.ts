export interface NodeTypeConfig {
  type: string
  label: string
  fullName: string
  description: string
  colorClass: string
  bgClass: string
  borderClass: string
  dotClass: string
}

export const AVAILABLE_NODE_TYPES: NodeTypeConfig[] = [
  {
    type: 'contextBias',
    label: 'Context',
    fullName: 'Context & Bias',
    description: 'Higher timeframe trend or market context',
    colorClass: 'text-sky-700',
    bgClass: 'bg-sky-50 hover:bg-sky-100',
    borderClass: 'border-sky-200',
    dotClass: 'bg-sky-500'
  },
  {
    type: 'conditionFilter',
    label: 'Condition',
    fullName: 'Condition & Rule',
    description: 'Rule or filter requirement before trade setup',
    colorClass: 'text-indigo-700',
    bgClass: 'bg-indigo-50 hover:bg-indigo-100',
    borderClass: 'border-indigo-200',
    dotClass: 'bg-indigo-500'
  },
  {
    type: 'decisionBranch',
    label: 'Decision',
    fullName: 'Decision Gate',
    description: 'Branching logic (Yes / No)',
    colorClass: 'text-amber-700',
    bgClass: 'bg-amber-50 hover:bg-amber-100',
    borderClass: 'border-amber-200',
    dotClass: 'bg-amber-500'
  },
  {
    type: 'entryTrigger',
    label: 'Trigger',
    fullName: 'Entry Trigger',
    description: 'Execution trigger event (limit or market order)',
    colorClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50 hover:bg-emerald-100',
    borderClass: 'border-emerald-200',
    dotClass: 'bg-emerald-500'
  },
  {
    type: 'riskInvalidation',
    label: 'Risk/Exit',
    fullName: 'Risk & Exit',
    description: 'SL rule, target RR, and invalidation criteria',
    colorClass: 'text-rose-700',
    bgClass: 'bg-rose-50 hover:bg-rose-100',
    borderClass: 'border-rose-200',
    dotClass: 'bg-rose-500'
  }
]

export const createInitialDataForType = (type: string): Record<string, any> => {
  if (type === 'contextBias') {
    return {
      title: 'Market Bias & Context',
      description: 'Define higher timeframe trend or session parameters',
      timeframe: '1H',
      bias: 'Bullish'
    }
  } else if (type === 'conditionFilter') {
    return {
      title: 'Key Condition',
      description: 'Requirement before seeking trade confirmation',
      isMandatory: true,
      tag: 'Filter'
    }
  } else if (type === 'decisionBranch') {
    return {
      title: 'Validation Decision',
      description: 'Does the market structure confirm the setup?',
      yesLabel: 'Yes -> Enter',
      noLabel: 'No -> Abort'
    }
  } else if (type === 'entryTrigger') {
    return {
      title: 'Execution Trigger',
      description: 'Exact trigger event (e.g. M1 sweep, limit at 50% FVG)',
      orderType: 'Market',
      confirmation: 'Confirmation candle'
    }
  } else if (type === 'riskInvalidation') {
    return {
      title: 'Risk & Invalidation',
      description: 'Stop loss placement and condition that voids setup',
      slRule: 'Below swing low',
      targetRr: '3.0R',
      invalidation: 'Structure broken before fill'
    }
  }
  return { title: 'New Rule' }
}
