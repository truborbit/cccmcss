import { Link } from "wouter";
import { useArticles } from "@/hooks/use-articles";
import { useCategories } from "@/hooks/use-categories";
import { format } from "date-fns";
import { ArrowRight, Search, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: articles, isLoading } = useArticles({ 
    status: "published",
    search: search || undefined
  });
  const { data: categories } = useCategories();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-serif font-bold text-xl">
                C
              </div>
              <span className="font-display font-bold text-xl tracking-tight">Chronicle</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  className="pl-9 h-9 bg-muted/50 border-none focus:ring-1"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {isAuthenticated ? (
                <Link href="/admin">
                  <span className="text-sm font-medium text-primary hover:underline cursor-pointer">
                    Dashboard
                  </span>
                </Link>
              ) : (
                <a href="/api/login" className="text-sm font-medium text-primary hover:underline">
                  Sign In
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 md:py-32 border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 text-foreground tracking-tight">
            Curated Insights for the Modern Mind
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore a collection of thoughts, stories, and ideas crafted by our editors.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories?.map((cat) => (
              <Badge key={cat.id} variant="secondary" className="px-3 py-1 text-sm rounded-full">
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="flex items-center gap-2 mb-8">
          <LayoutGrid className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-2xl font-bold font-display">Latest Stories</h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        ) : articles?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No articles found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles?.map((article) => (
              <Link key={article.id} href={`/article/${article.id}`}>
                <article className="group cursor-pointer flex flex-col h-full bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                  {/* Fallback image logic would go here */}
                  <div className="aspect-video w-full bg-muted/50 relative overflow-hidden">
                    {article.metadata?.ogImage ? (
                      <img 
                        src={article.metadata.ogImage} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 font-display text-4xl font-bold">
                        {article.title[0]}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-primary/60">
                        {article.language === 'en' ? 'English' : article.language}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {article.publishedAt ? format(new Date(article.publishedAt), 'MMM d, yyyy') : 'Draft'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold font-display mb-2 group-hover:text-primary/80 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1">
                      {article.excerpt || "No excerpt available."}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t mt-auto">
                      <div className="flex items-center gap-2">
                        {article.author && (
                          <span className="text-xs font-medium text-muted-foreground">
                            By {article.author.firstName}
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                        Read More <ArrowRight className="ml-1 w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
