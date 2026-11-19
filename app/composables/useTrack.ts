/** PRD §11 측정 이벤트. 분석 도구(GA4 / Umami / Plausible)가 정해지면 send 부분만 바꾼다. */
export type TrackEvent =
  | 'pick_start'
  | 'search_no_result'
  | 'result_view'
  | 'keyword_feedback'
  | 'want_click'
  | 'repick'

export function track(event: TrackEvent, payload: Record<string, unknown> = {}) {
  if (import.meta.server) return
  console.debug('[track]', event, payload)
}
