import type { Node, Edge } from '@vue-flow/core'

export interface PlaybookTemplate {
  id: string
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export const PLAYBOOK_TEMPLATES: PlaybookTemplate[] = [
  {
    id: 'smc_ict',
    name: 'SMC / ICT Strategy Flow',
    description: 'HTF Liquidity Sweep -> LTF Market Structure Shift -> FVG/OTE Entry -> Risk Targets',
    nodes: [
      {
        id: 'node-1',
        type: 'contextBias',
        position: { x: 250, y: 50 },
        data: {
          title: 'HTF Liquidity Sweep',
          description: 'Wait for 4H/1H Asia or London session high/low sweep',
          bias: 'Bullish',
          timeframe: '1H'
        }
      },
      {
        id: 'node-2',
        type: 'conditionFilter',
        position: { x: 250, y: 220 },
        data: {
          title: 'M15 Market Structure Shift',
          description: 'Displacement breaking recent swing high with clear Fair Value Gap',
          isMandatory: true,
          tag: 'Structure'
        }
      },
      {
        id: 'node-3',
        type: 'decisionBranch',
        position: { x: 250, y: 390 },
        data: {
          title: 'FVG overlaps with OTE (62%-79%)?',
          description: 'Measure swing using Fibonacci retracement to confirm discount/premium pricing',
          yesLabel: 'Yes -> Set Limit',
          noLabel: 'No -> Skip Trade'
        }
      },
      {
        id: 'node-4',
        type: 'entryTrigger',
        position: { x: 420, y: 580 },
        data: {
          title: 'Limit Entry at FVG Equilibrium',
          description: 'Place limit order at 50% Fair Value Gap discount level',
          orderType: 'Limit',
          confirmation: 'M1 rejection or M5 close'
        }
      },
      {
        id: 'node-5',
        type: 'riskInvalidation',
        position: { x: 420, y: 770 },
        data: {
          title: 'Risk & Target Management',
          description: 'Target opposing swing high liquidity pool',
          slRule: '1 pip below displacement swing low',
          targetRr: '3.5R',
          invalidation: 'Structure broken before limit fill'
        }
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'node-1',
        target: 'node-2',
        animated: true,
        style: { stroke: '#0284c7', strokeWidth: 2 }
      },
      {
        id: 'e2-3',
        source: 'node-2',
        target: 'node-3',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      },
      {
        id: 'e3-4',
        source: 'node-3',
        sourceHandle: 'yes',
        target: 'node-4',
        label: 'Passed',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      },
      {
        id: 'e4-5',
        source: 'node-4',
        target: 'node-5',
        animated: true,
        style: { stroke: '#f43f5e', strokeWidth: 2 }
      }
    ]
  },
  {
    id: 'breakout_retest',
    name: 'Breakout & Retest Flow',
    description: 'Key S/R Level -> Volume Breakout -> Retest Confirmation -> Market Entry -> Tight SL',
    nodes: [
      {
        id: 'node-1',
        type: 'contextBias',
        position: { x: 250, y: 50 },
        data: {
          title: 'Key Daily / 4H S/R Level',
          description: 'Prominent support or resistance zone with multi-touch validation',
          bias: 'Bullish',
          timeframe: '4H'
        }
      },
      {
        id: 'node-2',
        type: 'conditionFilter',
        position: { x: 250, y: 220 },
        data: {
          title: 'High-Volume Breakout Candle',
          description: 'Solid candle closing cleanly beyond the zone with above-average volume',
          isMandatory: true,
          tag: 'Breakout'
        }
      },
      {
        id: 'node-3',
        type: 'decisionBranch',
        position: { x: 250, y: 390 },
        data: {
          title: 'Clean Retest on Lower Volume?',
          description: 'Price pulls back without piercing through the broken level',
          yesLabel: 'Clean Retest',
          noLabel: 'Fakeout -> Abort'
        }
      },
      {
        id: 'node-4',
        type: 'entryTrigger',
        position: { x: 420, y: 580 },
        data: {
          title: 'Bullish Engulfing Market Entry',
          description: 'Enter on the close of reversal candle reacting to the retest',
          orderType: 'Market',
          confirmation: 'M15 Reversal Candle'
        }
      },
      {
        id: 'node-5',
        type: 'riskInvalidation',
        position: { x: 420, y: 770 },
        data: {
          title: 'Exit & Risk Parameters',
          description: 'Target next major psychological or structural resistance',
          slRule: '10 pips below retest swing low',
          targetRr: '2.5R',
          invalidation: 'Candle closes back inside range'
        }
      }
    ],
    edges: [
      {
        id: 'e1-2',
        source: 'node-1',
        target: 'node-2',
        animated: true,
        style: { stroke: '#0284c7', strokeWidth: 2 }
      },
      {
        id: 'e2-3',
        source: 'node-2',
        target: 'node-3',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 }
      },
      {
        id: 'e3-4',
        source: 'node-3',
        sourceHandle: 'yes',
        target: 'node-4',
        label: 'Confirmed',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      },
      {
        id: 'e4-5',
        source: 'node-4',
        target: 'node-5',
        animated: true,
        style: { stroke: '#f43f5e', strokeWidth: 2 }
      }
    ]
  }
]
