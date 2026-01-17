import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  const aiProviders = [
    { name: 'GPT-5.2', icon: '🧠', color: '#10a37f' },
    { name: 'Claude 4.5', icon: '🔮', color: '#d97706' },
    { name: 'Gemini 3', icon: '✨', color: '#4285f4' },
    { name: 'Llama 4', icon: '🦙', color: '#6366f1' },
    { name: 'Groq', icon: '⚡', color: '#f97316' },
    { name: 'Grok 4', icon: '🚀', color: '#1d9bf0' },
  ];

  const features = [
    {
      icon: '🤖',
      title: 'Multi-AI Battles',
      description: 'Pit GPT-5 against Claude 4.5, Gemini 3 vs Grok - any combination of cutting-edge AI models.',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: '💬',
      title: 'Live Commentary',
      description: 'Watch AI models react in real-time with strategic analysis and playful trash talk.',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: '📊',
      title: 'Leaderboard',
      description: 'Track which AI dominates the arena with detailed win rates and match history.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: '🎮',
      title: 'Classic Gameplay',
      description: 'Authentic Snake & Ladder experience with beautiful visuals and smooth animations.',
      gradient: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="min-h-screen noise">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xl">
              🎲
            </div>
            <span className="font-bold text-lg tracking-tight">AI Arena</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Leaderboard
            </Link>
            <Link href="/game">
              <Button className="btn-premium px-6">
                Play Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-white/10 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-muted-foreground">Powered by Latest 2026 AI Models</span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
              <span className="gradient-text">AI vs AI</span>
              <br />
              <span className="text-foreground">Snake & Ladder</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Watch the world&apos;s most advanced AI models compete in the classic game.
              Pick your fighters, witness epic battles, and discover which AI reigns supreme.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/game">
                <Button size="lg" className="btn-premium text-lg px-8 py-6 rounded-2xl w-full sm:w-auto">
                  <span className="mr-2">🎮</span>
                  Start a Match
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-2xl glass border-white/10 hover:bg-white/5 w-full sm:w-auto">
                  <span className="mr-2">🏆</span>
                  View Leaderboard
                </Button>
              </Link>
            </div>

            {/* AI Provider Pills */}
            <div className="flex flex-wrap justify-center gap-3">
              {aiProviders.map((ai) => (
                <div
                  key={ai.name}
                  className="flex items-center gap-2 px-4 py-2 rounded-full glass-light border border-white/5 hover:border-white/20 transition-all cursor-default"
                >
                  <span>{ai.icon}</span>
                  <span className="text-sm font-medium" style={{ color: ai.color }}>
                    {ai.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why AI <span className="gradient-text">Arena</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Experience the future of gaming where artificial intelligence takes the spotlight
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group glass rounded-3xl p-8 border border-white/5 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 pb-32">
          <div className="relative glass rounded-3xl p-12 md:p-16 text-center overflow-hidden border border-white/5">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-600/20" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Watch AI Battle?
              </h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                Configure your AI fighters, grab some popcorn, and enjoy the show.
              </p>
              <Link href="/game">
                <Button size="lg" className="btn-premium text-xl px-12 py-7 rounded-2xl animate-pulse-glow">
                  <span className="mr-3">⚔️</span>
                  Enter the Arena
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            🔒 API keys are stored locally and never sent to our servers
          </p>
          <p className="text-sm text-muted-foreground">
            Made with 💜 for AI enthusiasts
          </p>
        </div>
      </footer>
    </div>
  );
}
