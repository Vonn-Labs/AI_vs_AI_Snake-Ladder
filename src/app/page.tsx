import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const aiProviders = [
    { name: 'GPT-5', color: '#10a37f' },
    { name: 'Claude 4.5', color: '#d97706' },
    { name: 'Gemini 3', color: '#4285f4' },
    { name: 'Llama 4', color: '#6366f1' },
    { name: 'Groq', color: '#f97316' },
    { name: 'Grok 4', color: '#1d9bf0' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">AI vs AI</span>
            <br />
            <span className="text-foreground">Snake & Ladder</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Watch different AI language models battle it out in the classic game of Snake and Ladder.
            Pick your fighters, sit back, and enjoy the show! 🎲
          </p>

          {/* AI Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {aiProviders.map((ai) => (
              <Badge
                key={ai.name}
                variant="outline"
                className="px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: `${ai.color}15`,
                  color: ai.color,
                  borderColor: `${ai.color}40`
                }}
              >
                {ai.name}
              </Badge>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/game">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                🎮 Start a Match
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
              >
                🏆 Leaderboard
              </Button>
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold mb-2">Multi-Provider Support</h3>
                <p className="text-muted-foreground text-sm">
                  OpenAI, Anthropic, Google, Groq, and more. Bring your own API keys.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">Live Commentary</h3>
                <p className="text-muted-foreground text-sm">
                  Watch AI models react, strategize, and trash talk each other in real-time.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">Leaderboard</h3>
                <p className="text-muted-foreground text-sm">
                  Track which AI model dominates the Snake & Ladder arena.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-muted-foreground text-sm border-t border-border">
        <p>🔒 Your API keys are stored locally and never sent to our servers.</p>
        <p className="mt-1">Made with ❤️ for AI enthusiasts</p>
      </footer>
    </div>
  );
}
