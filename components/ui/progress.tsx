export function Progress({ current, total }: { current: number; total: number }) {
  const percent = Math.round((current / total) * 100);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-stone-500">
        <span>Ritual progress</span>
        <span>{percent}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-stone-200/70">
        <div
          className="h-1.5 rounded-full bg-stone-700 transition-all duration-700 ease-in-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
