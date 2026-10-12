import type { Meta, StoryObj } from '@storybook/vue3'
import ExportExcelButton from '../renderer/src/components/ui/ExportExcelButton.vue'

const mockTrades = [
  {
    id: 1,
    entryDatetime: '2026-10-10T14:30:00Z',
    setupName: 'FVG + Order Block',
    symbol: 'EURUSD',
    position: 'Buy',
    sessionName: 'London',
    normalRr: 2.5,
    rr: 2.5,
    pnl: 250,
    quality: 'Green',
    notes: 'Clean liquidity sweep followed by sharp displacement'
  },
  {
    id: 2,
    entryDatetime: '2026-10-11T16:00:00Z',
    setupName: 'Break of Structure',
    symbol: 'XAUUSD',
    position: 'Sell',
    sessionName: 'New York',
    normalRr: -1.0,
    rr: -1.0,
    pnl: -100,
    quality: 'Red',
    notes: 'Premature entry before confirmed candle close'
  },
  {
    id: 3,
    entryDatetime: '2026-10-12T09:15:00Z',
    setupName: 'Asia Range Breakout',
    symbol: 'GBPUSD',
    position: 'Buy',
    sessionName: 'London',
    normalRr: 3.2,
    rr: 3.2,
    pnl: 320,
    quality: 'Green',
    notes: 'Followed plan precisely, target hit during London open'
  }
]

const mockKpis = {
  totalTrades: 3,
  wins: 2,
  losses: 1,
  breakEvens: 0,
  winRate: 66.7,
  profitFactor: 5.7,
  netPnl: 470,
  grossProfit: 570,
  grossLoss: 100,
  avgRr: 1.57,
  maxDrawdown: 100
}

const meta: Meta<typeof ExportExcelButton> = {
  title: 'UI/ExportExcelButton',
  component: ExportExcelButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'primary', 'secondary', 'compact']
    },
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    statMode: {
      control: 'select',
      options: ['normal', 'be', 'trail']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    trades: mockTrades,
    kpis: mockKpis,
    statMode: 'normal',
    variant: 'outline',
    label: 'Export Data'
  }
}

export const PrimaryVariant: Story = {
  args: {
    trades: mockTrades,
    kpis: mockKpis,
    statMode: 'normal',
    variant: 'primary',
    label: 'Download Excel Report'
  }
}

export const CompactVariant: Story = {
  args: {
    trades: mockTrades,
    kpis: mockKpis,
    statMode: 'normal',
    variant: 'compact',
    label: 'Export'
  }
}

export const DisabledNoTrades: Story = {
  args: {
    trades: [],
    kpis: undefined,
    statMode: 'normal',
    variant: 'outline',
    label: 'Export Excel'
  }
}
