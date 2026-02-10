import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import ArticleDetail from "@/pages/ArticleDetail";
import Dashboard from "@/pages/admin/Dashboard";
import AdminArticles from "@/pages/admin/Articles";
import ArticleEdit from "@/pages/admin/ArticleEdit";
import AdminCategories from "@/pages/admin/Categories";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/article/:id" component={ArticleDetail} />

      {/* Admin Protected Routes */}
      <Route path="/admin">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/admin/articles">
        {() => <ProtectedRoute component={AdminArticles} />}
      </Route>
      <Route path="/admin/articles/:id">
        {() => <ProtectedRoute component={ArticleEdit} />}
      </Route>
      <Route path="/admin/categories">
        {() => <ProtectedRoute component={AdminCategories} />}
      </Route>
      
      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
