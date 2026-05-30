import { polaroidMarkers } from "@/app/data/polaroids";

// A vertically scrolling list of polaroids, shown alongside the globe.
export const PolaroidStrip = () => {
  return (
    <div className="flex h-screen flex-col items-center gap-6 overflow-y-auto py-12">
      {polaroidMarkers.map((m) => (
        <div
          key={m.id}
          style={{ rotate: `${m.rotate}deg` }}
          className="shrink-0 rounded-sm bg-white p-1.5 pb-5 shadow-lg transition-transform duration-200 hover:rotate-0 hover:-translate-y-1"
        >
          <img
            src={m.image}
            alt={m.caption}
            className="block h-36 w-36 rounded-sm bg-gray-200 object-cover"
          />
          <span className="mt-1.5 block text-center text-sm text-gray-700">
            {m.caption}
          </span>
        </div>
      ))}
    </div>
  );
};
