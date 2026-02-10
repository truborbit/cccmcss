import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // Articles
  app.get(api.articles.list.path, async (req, res) => {
    const params = api.articles.list.input?.parse(req.query);
    const articles = await storage.getArticles(params);
    res.json(articles);
  });

  app.get(api.articles.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(404).json({ message: "Invalid ID" });
    
    const article = await storage.getArticle(id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  });

  app.post(api.articles.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const input = api.articles.create.input.parse(req.body);
      // Assuming replit auth puts user claims in req.user
      const authorId = req.user.claims.sub;
      
      const article = await storage.createArticle({ ...input, authorId });
      res.status(201).json(article);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.articles.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.articles.update.input.parse(req.body);
      
      // Ideally we check if user owns article or is admin here
      
      const article = await storage.updateArticle(id, input);
      res.json(article);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.articles.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteArticle(id);
    res.status(204).send();
  });

  // Categories
  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get(api.categories.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const category = await storage.getCategory(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  });

  app.post(api.categories.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.categories.create.input.parse(req.body);
      const category = await storage.createCategory(input);
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.categories.update.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    const input = api.categories.update.input.parse(req.body);
    const category = await storage.updateCategory(id, input);
    res.json(category);
  });

  app.delete(api.categories.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteCategory(id);
    res.status(204).send();
  });

  return httpServer;
}

// Seed function (optional but good for testing)
async function seed() {
  const cats = await storage.getCategories();
  if (cats.length === 0) {
    await storage.createCategory({ name: "Technology", slug: "technology", description: "Tech news" });
    await storage.createCategory({ name: "Life", slug: "life", description: "Lifestyle" });
  }
}

// Call seed but don't wait for it
seed().catch(console.error);
