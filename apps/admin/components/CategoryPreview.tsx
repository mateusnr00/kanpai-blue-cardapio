type Props = {
  gradient: string;
  label: string;
};

export function CategoryPreview({ gradient, label }: Props) {
  return (
    <span
      className="inline-flex h-8 w-20 items-center justify-center rounded-md text-[10px] font-medium uppercase tracking-wide text-white shadow-sm"
      style={{ background: gradient }}
    >
      {label.slice(0, 5)}
    </span>
  );
}
