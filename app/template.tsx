/*
  A template (unlike a layout) remounts on every navigation, so each page
  fades in gently. Opacity only: a transformed ancestor would break any
  position:fixed modal inside a page.
  The wrapper also gives the skip link something to jump to.
*/
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="content"
      tabIndex={-1}
      className="zt-page flex flex-1 flex-col outline-none"
    >
      {children}
    </div>
  )
}
