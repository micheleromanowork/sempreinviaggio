import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const destinations = sqliteTable('destinations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  image: text('image'),
  parentId: integer('parent_id'),
  seoTitle: text('seo_title'),
  metaDescription: text('meta_description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull().default(''),
  coverImage: text('cover_image'),
  status: text('status').notNull().default('draft'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  categoryId: integer('category_id'),
  destinationId: integer('destination_id'),
  authorId: integer('author_id').notNull(),
  articleType: text('article_type').notNull().default('guida'),
  seoTitle: text('seo_title'),
  metaDescription: text('meta_description'),
  ogTitle: text('og_title'),
  ogDescription: text('og_description'),
  ogImage: text('og_image'),
  canonicalUrl: text('canonical_url'),
  featured: integer('featured', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const articleTags = sqliteTable('article_tags', {
  articleId: integer('article_id').notNull(),
  tagId: integer('tag_id').notNull(),
})

export const media = sqliteTable('media', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  path: text('path').notNull(),
  url: text('url').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  altText: text('alt_text').default(''),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const pages = sqliteTable('pages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull().default(''),
  seoTitle: text('seo_title'),
  metaDescription: text('meta_description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
})

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
})

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  articles: many(articles),
}))

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}))

export const destinationsRelations = relations(destinations, ({ many, one }) => ({
  articles: many(articles),
  parent: one(destinations, {
    fields: [destinations.parentId],
    references: [destinations.id],
    relationName: 'parentDestination',
  }),
  children: many(destinations, { relationName: 'parentDestination' }),
}))

export const articlesRelations = relations(articles, ({ one, many }) => ({
  author: one(users, { fields: [articles.authorId], references: [users.id] }),
  category: one(categories, { fields: [articles.categoryId], references: [categories.id] }),
  destination: one(destinations, { fields: [articles.destinationId], references: [destinations.id] }),
  articleTags: many(articleTags),
}))

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, { fields: [articleTags.articleId], references: [articles.id] }),
  tag: one(tags, { fields: [articleTags.tagId], references: [tags.id] }),
}))
