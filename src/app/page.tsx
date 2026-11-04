export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-6">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 text-xs font-mono uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Foundation Scaffolding Complete
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-500 bg-clip-text text-transparent">
          FolioCity
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
          Indian stock portfolio visualizer rendering investments as a neon
          cyberpunk 3D cityscape. Built with Next.js App Router, React Three
          Fiber, PostgreSQL, Drizzle ORM, and Better Auth.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 text-xs font-mono text-zinc-400">
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/50">
            <span className="block text-zinc-500">Framework</span>
            <span className="text-zinc-200">Next.js App Router</span>
          </div>
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/50">
            <span className="block text-zinc-500">3D Graphics</span>
            <span className="text-zinc-200">React Three Fiber</span>
          </div>
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/50">
            <span className="block text-zinc-500">Database & ORM</span>
            <span className="text-zinc-200">Postgres + Drizzle</span>
          </div>
          <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/50">
            <span className="block text-zinc-500">Authentication</span>
            <span className="text-zinc-200">Better Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
