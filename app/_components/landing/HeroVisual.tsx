type Template = {
  name: string;
  key: string;
  thumbnailUrl: string | null;
};

/**
 * Browser-mockup hero illustration. Server component (no interactivity)
 * — receives the featured template from the page and renders a tilted
 * frame with floating accent badges around it.
 */
export default function HeroVisual({ template }: { template: Template | null }) {
  return (
    <div className="relative">
      {/* Glow halo behind the frame */}
      <div className="absolute -inset-10 -z-10 rounded-[40px] bg-gradient-to-br from-orange-200/50 via-pink-200/50 to-purple-200/50 opacity-70 blur-3xl animate-gradient" />

      {/* Browser frame */}
      <div className="relative rotate-1 overflow-hidden rounded-[20px] border border-[#E6E6E6] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-transform duration-500 hover:rotate-0">
        {/* Chrome */}
        <div className="flex items-center gap-1.5 border-b border-[#E6E6E6] bg-gray-50 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <div className="ml-3 flex h-7 min-w-0 flex-1 items-center gap-2 truncate rounded-md bg-white px-3 text-xs text-gray-500">
            <span className="text-green-500">●</span>
            {template?.key ?? "salon"}.storinka.com
          </div>
        </div>
        {/* Screenshot */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {template?.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={template.thumbnailUrl}
              alt={template.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Прев&apos;ю шаблону
            </div>
          )}
        </div>
      </div>

      {/* Floating badge: live indicator */}
      <div className="absolute -right-3 -top-4 flex items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-float md:-right-6">
        <span className="h-2 w-2 rounded-full bg-white" />
        LIVE
      </div>

      {/* Floating card: launch time */}
      <div className="absolute -bottom-6 -left-4 rounded-[14px] border border-[#E6E6E6] bg-white px-4 py-3 shadow-xl animate-float-slow md:-left-8">
        <div className="text-[11px] uppercase tracking-wide text-gray-500">
          Опубліковано
        </div>
        <div className="mt-0.5 text-base font-bold text-gray-900">за 7 хвилин</div>
      </div>

      {/* Floating card: price tag */}
      <div className="absolute -right-2 bottom-12 hidden rounded-[12px] border border-[#E6E6E6] bg-white px-3 py-2 shadow-xl animate-float md:block">
        <div className="text-[10px] uppercase tracking-wide text-gray-500">від</div>
        <div className="text-sm font-bold text-gray-900">490 грн/міс</div>
      </div>

    </div>
  );
}
