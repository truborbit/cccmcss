import { useRoute } from "wouter";
import { useArticle } from "@/hooks/use-articles";
import { format } from "date-fns";
import { ArrowLeft, Share2, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleDetail() {
  const [, params] = useRoute("/article/:id");
  const { data: article, isLoading } = useArticle(Number(params?.id));

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 space-y-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-16 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold font-display mb-4">Article Not Found</h1>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary/80">
              <ArrowLeft className="w-4 h-4" />
              Back to Stories
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 mt-12 md:mt-20">
        {/* Article Header */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium uppercase tracking-wider">
              {article.categories?.[0]?.name || "Article"}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mb-6 text-foreground">
            {article.title}
          </h1>

          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {article.author && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{article.author.firstName} {article.author.lastName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {article.publishedAt 
                  ? format(new Date(article.publishedAt), "MMMM d, yyyy") 
                  : "Draft"}
              </span>
            </div>
          </div>
        </header>

        {/* Feature Image */}
        {article.metadata?.ogImage && (
          <div className="rounded-2xl overflow-hidden mb-12 shadow-2xl shadow-primary/5">
            <img 
              src={article.metadata.ogImage} 
              alt={article.title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none 
            prose-headings:font-display prose-headings:font-bold 
            prose-p:leading-relaxed prose-p:text-muted-foreground
            prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Article Footer */}
        <div className="border-t mt-16 pt-8">
          <div className="flex flex-wrap gap-2">
            {article.categories?.map((cat) => (
              <span key={cat.id} className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                #{cat.slug}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
