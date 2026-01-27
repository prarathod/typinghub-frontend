type PlaceholderPageProps = {
  title: string;
  description: string;
};

export const PlaceholderPage = ({
  title,
  description
}: PlaceholderPageProps) => {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-16 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-600">{description}</p>
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-sm text-slate-500 shadow-sm">
        This section will open as soon as paid memberships and rankings go
        live.
      </div>
    </div>
  );
};
