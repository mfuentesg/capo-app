export default function Page() {
  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your project.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6 shadow-sm">
            <h3 className="font-semibold">Card {i}</h3>
            <p className="text-sm text-muted-foreground">
              This is a sample card to demonstrate the layout.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
