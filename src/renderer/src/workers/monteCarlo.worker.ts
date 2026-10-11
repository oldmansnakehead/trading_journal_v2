import { runMonteCarloSimulation, SimulationInput } from '../utils/monteCarlo'

self.onmessage = (event: MessageEvent<{ type: string; input: SimulationInput }>) => {
  if (event.data.type === 'START') {
    try {
      const result = runMonteCarloSimulation(event.data.input, (progressPct) => {
        self.postMessage({ type: 'PROGRESS', progress: progressPct })
      })
      self.postMessage({ type: 'RESULT', data: result })
    } catch (err: any) {
      self.postMessage({ type: 'ERROR', error: err.message || String(err) })
    }
  }
}
