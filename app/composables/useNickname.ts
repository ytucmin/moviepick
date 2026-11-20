const KEY = 'moviepick:nickname'
export const NICKNAME_MAX = 12

/** 닉네임 로그인: 서버 없이 이 브라우저에만 저장 (PRD는 로그인 없음, 사용자 요청으로 추가) */
export function useNickname() {
  const nickname = useState<string | null>('nickname', () => {
    try {
      return localStorage.getItem(KEY)
    } catch {
      return null
    }
  })

  function login(name: string): boolean {
    const value = name.trim().slice(0, NICKNAME_MAX)
    if (!value) return false
    nickname.value = value
    try {
      localStorage.setItem(KEY, value)
    } catch {}
    return true
  }

  function logout() {
    nickname.value = null
    try {
      localStorage.removeItem(KEY)
    } catch {}
  }

  return { nickname, login, logout }
}
