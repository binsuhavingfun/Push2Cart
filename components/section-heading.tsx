export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-secondary">
        {eyebrow}
      </p>
      <h2 className="pixel-heading text-2xl text-white sm:text-3xl">{title}</h2>
      <p className="max-w-2xl text-white/70">{description}</p>
    </div>
  );
}
