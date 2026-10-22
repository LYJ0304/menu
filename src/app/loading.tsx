export default function Loading() {
  return (
    <main
      id="main-content"
      aria-busy="true"
      aria-label="식단 불러오는 중"
      className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-8"
    >
      <p className="sr-only" role="status">
        식단을 불러오고 있습니다.
      </p>
      <div aria-hidden="true" className="space-y-8 motion-safe:animate-pulse">
        <div className="h-24 w-2/3 rounded-2xl bg-line/60" />
        <div className="h-48 rounded-3xl border border-line bg-white" />
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="h-88 rounded-3xl border border-line bg-white"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
