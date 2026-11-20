import { josa } from 'es-hangul'

// 숫자를 읽었을 때 받침이 있는 끝자리: 0(영·십·백·천·만) 1(일) 3(삼) 6(육) 7(칠) 8(팔)
const DIGIT_WITH_BATCHIM = '013678'

/**
 * 제목 뒤에 붙일 "을/를". es-hangul은 숫자 읽기와 끝 문장부호를 처리하지 못해서
 * 끝 문장부호는 빼고, 숫자로 끝나면 읽는 소리로 고른다 (QA-02).
 * 예: 1917 → 을, 블레이드 러너 2049 → 를, 너의 이름은. → 을
 */
export function objectParticle(word: string): '을' | '를' {
  const core = word.replace(/[^0-9A-Za-z가-힣]+$/, '') || word
  const last = core.at(-1) ?? ''
  if (/[0-9]/.test(last)) return DIGIT_WITH_BATCHIM.includes(last) ? '을' : '를'
  return josa.pick(core, '을/를')
}
