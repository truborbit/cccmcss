import { AdminSidebar } from "@/components/AdminSidebar";
import { useArticles, useCreateArticle, useDeleteArticle } from "@/hooks/use-articles";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function AdminArticles() {
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const { data: articles, isLoading } = useArticles({ search });
  const createArticle = useCreateArticle();
  const deleteArticle = useDeleteArticle();

  const handleCreate = () => {
    createArticle.mutate(
      {
        title: "Untitled Article",
        slug: `untitled-${Date.now()}`,
        content: "<p>Start writing...</p>",
        status: "draft",
        language: "en"
      },
      {
        onSuccess: (data) => {
          setLocation(`/admin/articles/${data.id}`);
        }
      }
    );
  };

  const statusColors: Record<string, string> = {
    published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold">Articles</h1>
            <p className="text-muted-foreground mt-1">Manage your content and stories</p>
          </div>
          <Button onClick={handleCreate} disabled={createArticle.isPending}>
            {createArticle.isPending ? "Creating..." : <><Plus className="w-4 h-4 mr-2" /> New Article</>}
          </Button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm">
          <div className="p-4 border-b flex items-center gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading articles...
                  </TableCell>
                </TableRow>
              ) : articles?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    No articles found. Create your first one!
                  </TableCell>
                </TableRow>
              ) : (
                articles?.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">
                      {article.title}
                      <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[300px]">
                        /{article.slug}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusColors[article.status]}>
                        {article.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.author?.firstName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(article.updatedAt || new Date()), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/articles/${article.id}`}>
                          <Button variant="ghost" size="icon">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the article.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteArticle.mutate(article.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
