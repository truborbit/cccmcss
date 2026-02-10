import { AdminSidebar } from "@/components/AdminSidebar";
import { useArticle, useUpdateArticle } from "@/hooks/use-articles";
import { useCategories } from "@/hooks/use-categories";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArticleEditor } from "@/components/ArticleEditor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertArticleSchema } from "@shared/schema";
import { z } from "zod";
import { useEffect } from "react";
import { ArrowLeft, Save, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = insertArticleSchema.extend({
  categoryIds: z.array(z.number()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function ArticleEdit() {
  const [, params] = useRoute("/admin/articles/:id");
  const [, setLocation] = useLocation();
  const id = Number(params?.id);
  
  const { data: article, isLoading } = useArticle(id);
  const { data: categories } = useCategories();
  const updateArticle = useUpdateArticle();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      status: "draft",
      language: "en",
      metadata: {},
      categoryIds: [],
    },
  });

  // Load data into form
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || "",
        content: article.content,
        status: article.status as "draft" | "published" | "archived",
        language: article.language,
        metadata: article.metadata || {},
        categoryIds: article.categories?.map(c => c.id) || [],
      });
    }
  }, [article, form]);

  const onSubmit = (data: FormData) => {
    updateArticle.mutate({ id, data });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
          {/* Header */}
          <div className="h-16 border-b px-8 flex items-center justify-between bg-background sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                type="button" 
                onClick={() => setLocation("/admin/articles")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="font-semibold text-lg">Edit Article</h1>
              <div className="h-6 w-px bg-border mx-2" />
              <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
                form.watch("status") === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {form.watch("status")}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <Select
                value={form.watch("status")}
                onValueChange={(val) => form.setValue("status", val as any)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Button type="submit" disabled={updateArticle.isPending}>
                {updateArticle.isPending ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
              </Button>
            </div>
          </div>

          <div className="flex-1 p-8 grid grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="col-span-8 space-y-6">
              <div className="space-y-2">
                <Input
                  {...form.register("title")}
                  placeholder="Article Title"
                  className="text-3xl font-display font-bold border-none px-0 shadow-none h-auto placeholder:text-muted-foreground/50 focus-visible:ring-0"
                />
              </div>

              <ArticleEditor
                content={form.watch("content")}
                onChange={(html) => form.setValue("content", html, { shouldDirty: true })}
              />
            </div>

            {/* Sidebar Settings */}
            <div className="col-span-4 space-y-6">
              <div className="bg-card border rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Settings</h3>
                
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input {...form.register("slug")} />
                </div>

                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea {...form.register("excerpt")} className="h-24 resize-none" />
                  <p className="text-xs text-muted-foreground">Used for SEO and previews.</p>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <Select
                      value={form.watch("language")}
                      onValueChange={(val) => form.setValue("language", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={String(form.watch("categoryIds")?.[0] || "")}
                    onValueChange={(val) => form.setValue("categoryIds", [Number(val)])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image URL</Label>
                  <Input 
                    {...form.register("metadata.ogImage")} 
                    placeholder="https://..."
                  />
                  {/* Just a helper note for Unsplash */}
                  <p className="text-xs text-muted-foreground">Paste an Unsplash URL here.</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
