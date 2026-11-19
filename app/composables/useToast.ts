let timer: ReturnType<typeof setTimeout> | undefined

export function useToast() {
  const message = useState<string | null>('toast', () => null)

  function show(text: string, ms = 2400) {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => (message.value = null), ms)
  }

  return { message, show }
}
