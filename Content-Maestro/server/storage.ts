import { db } from "./db";
import {
  articles,
  categories,
  articleCategories,
  users,
  type Article,
  type InsertArticle,
  type UpdateArticleRequest,
  type Category,
  type InsertCategory,
  type ArticleResponse,
  type CreateArticleRequest
} from "@shared/schema";
import { eq, desc, and, ilike, inArray, sql } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Articles
  getArticles(params?: { 
    status?: string; 
    language?: string; 
    authorId?: string;
    categoryId?: number;
    search?: string;
  }): Promise<ArticleResponse[]>;
  getArticle(id: number): Promise<ArticleResponse | undefined>;
  getArticleBySlug(slug: string): Promise<ArticleResponse | undefined>;
  createArticle(article: CreateArticleRequest & { authorId: string }): Promise<Article>;
  updateArticle(id: number, updates: UpdateArticleRequest): Promise<Article>;
  deleteArticle(id: number): Promise<void>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getArticles(params?: { 
    status?: string; 
    language?: string; 
    authorId?: string;
    categoryId?: number;
    search?: string;
  }): Promise<ArticleResponse[]> {
    const conditions = [];

    if (params?.status) {
      conditions.push(eq(articles.status, params.status as any));
    }
    if (params?.language) {
      conditions.push(eq(articles.language, params.language));
    }
    if (params?.authorId) {
      conditions.push(eq(articles.authorId, params.authorId));
    }
    if (params?.search) {
      conditions.push(ilike(articles.title, `%${params.search}%`));
    }
    if (params?.categoryId) {
       // Subquery for category filtering if needed, or simple join logic
       // For simplicity in this iteration, we might fetch all and filter in app or doing a complex join
       // Let's rely on standard filtering for now.
       const articleIdsWithCategory = await db
         .select({ articleId: articleCategories.articleId })
         .from(articleCategories)
         .where(eq(articleCategories.categoryId, params.categoryId));
       
       if (articleIdsWithCategory.length > 0) {
          conditions.push(inArray(articles.id, articleIdsWithCategory.map(r => r.articleId)));
       } else {
          return []; // No articles in this category
       }
    }

    const query = db.query.articles.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(articles.createdAt)],
      with: {
        author: true,
        categories: {
          with: {
            category: true
          }
        }
      }
    });

    const results = await query;
    
    // Transform result to match ArticleResponse interface
    return results.map(article => ({
      ...article,
      categories: article.categories.map(c => c.category)
    }));
  }

  async getArticle(id: number): Promise<ArticleResponse | undefined> {
    const article = await db.query.articles.findFirst({
      where: eq(articles.id, id),
      with: {
        author: true,
        categories: {
          with: {
            category: true
          }
        }
      }
    });

    if (!article) return undefined;

    return {
      ...article,
      categories: article.categories.map(c => c.category)
    };
  }

  async getArticleBySlug(slug: string): Promise<ArticleResponse | undefined> {
    const article = await db.query.articles.findFirst({
      where: eq(articles.slug, slug),
      with: {
        author: true,
        categories: {
          with: {
            category: true
          }
        }
      }
    });

    if (!article) return undefined;

    return {
      ...article,
      categories: article.categories.map(c => c.category)
    };
  }

  async createArticle(data: CreateArticleRequest & { authorId: string }): Promise<Article> {
    const { categoryIds, ...articleData } = data;
    
    const [article] = await db.insert(articles).values(articleData).returning();

    if (categoryIds && categoryIds.length > 0) {
      await db.insert(articleCategories).values(
        categoryIds.map(catId => ({
          articleId: article.id,
          categoryId: catId
        }))
      );
    }

    return article;
  }

  async updateArticle(id: number, data: UpdateArticleRequest): Promise<Article> {
    const { categoryIds, ...updates } = data;

    const [updatedArticle] = await db
      .update(articles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(articles.id, id))
      .returning();

    if (categoryIds) {
      // Replace categories
      await db.delete(articleCategories).where(eq(articleCategories.articleId, id));
      
      if (categoryIds.length > 0) {
        await db.insert(articleCategories).values(
          categoryIds.map(catId => ({
            articleId: id,
            categoryId: catId
          }))
        );
      }
    }

    return updatedArticle;
  }

  async deleteArticle(id: number): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(data: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(data).returning();
    return category;
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category> {
    const [category] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }
}

export const storage = new DatabaseStorage();
