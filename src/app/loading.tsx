export default function Loading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="식단 불러오는 중"
      className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8"
    >
      <p className="sr-only" role="status">
        식단을 불러오고 있습니다.
      </p>
      <div aria-hidden="true" className="space-y-5 motion-safe:animate-pulse">
        <div className="h-8 w-24 rounded bg-line" />
        <div className="h-32 rounded-lg border border-line bg-surface" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-64 rounded-lg border border-line bg-surface"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
