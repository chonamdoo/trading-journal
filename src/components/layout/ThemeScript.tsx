/**
 * 다크모드 깜빡임(FOUC) 방지를 위한 인라인 스크립트
 * localStorage의 theme 값 또는 시스템 설정을 기반으로
 * html 요소에 dark 클래스를 렌더링 전에 적용한다.
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('theme');
        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {}
    })();
  `

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
    />
  )
}
