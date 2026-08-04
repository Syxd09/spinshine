import type { CmsImages } from "@/lib/cms-content";

type Props = {
  images: CmsImages;
  setImages: (next: CmsImages) => void;
};

export function ImagesTab({ images, setImages }: Props) {
  return (
    <div className="bg-card border border-border p-8 rounded-2xl shadow-soft space-y-6">
      <h2 className="text-lg font-bold text-foreground">CMS Image Configurations</h2>

      <div className="grid gap-6 md:grid-cols-2">
        {(Object.keys(images) as (keyof CmsImages)[]).map((key) => (
          <div key={key} className="p-4 rounded-xl border border-border bg-background space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
                {key} Image URL
              </label>
              <span className="text-[9px] text-teal uppercase font-bold">dynamic asset</span>
            </div>
            <input
              type="text"
              value={images[key]}
              onChange={(e) => setImages({ ...images, [key]: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-border text-xs font-semibold bg-background"
            />
            <div className="aspect-[16/9] w-full overflow-hidden rounded-lg border border-border/80">
              <img src={images[key]} alt={key} className="h-full w-full object-cover" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
