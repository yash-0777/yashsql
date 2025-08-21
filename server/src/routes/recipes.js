import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { readDb, writeDb, uploadsDir, sanitizeFilename } from '../utils/fsUtils.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${Date.now()}_${sanitizeFilename(base)}${ext}`);
  }
});
const upload = multer({ storage });

function parseMaybeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch {}
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function computeAverageRating(ratings) {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + (Number(r.value) || 0), 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

function publicRecipe(recipe, users) {
  const author = users.find(u => u.id === recipe.authorId);
  return {
    ...recipe,
    authorName: author ? author.name : 'Unknown',
  };
}

// Create Recipe
router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const ingredients = parseMaybeArray(req.body.ingredients);
    const instructions = parseMaybeArray(req.body.instructions);
    const categories = parseMaybeArray(req.body.categories);

    if (!title || !description || ingredients.length === 0 || instructions.length === 0) {
      if (req.file) await fs.remove(path.join(uploadsDir, req.file.filename));
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const db = await readDb();
    const recipe = {
      id: uuidv4(),
      authorId: req.user.id,
      title,
      description,
      categories,
      ingredients,
      instructions,
      imageUrl: `/uploads/${req.file.filename}`,
      comments: [],
      ratings: [],
      averageRating: 0,
      favoritesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.recipes.push(recipe);
    await writeDb(db);
    res.status(201).json(publicRecipe(recipe, db.users));
  } catch (err) {
    res.status(500).json({ message: 'Failed to create recipe' });
  }
});

// Get All Recipes
router.get('/', async (req, res) => {
  try {
    const db = await readDb();
    const items = db.recipes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(r => publicRecipe(r, db.users));
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipes' });
  }
});

// Get Single Recipe
router.get('/:id', async (req, res) => {
  try {
    const db = await readDb();
    const recipe = db.recipes.find(r => r.id === req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(publicRecipe(recipe, db.users));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recipe' });
  }
});

// Update Recipe
router.put('/:id', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.recipes.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Recipe not found' });
    const recipe = db.recipes[idx];
    if (recipe.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const ingredients = req.body.ingredients ? parseMaybeArray(req.body.ingredients) : recipe.ingredients;
    const instructions = req.body.instructions ? parseMaybeArray(req.body.instructions) : recipe.instructions;
    const categories = req.body.categories ? parseMaybeArray(req.body.categories) : recipe.categories;

    let imageUrl = recipe.imageUrl;
    if (req.file) {
      // remove old image
      if (recipe.imageUrl) {
        const oldPath = path.join(uploadsDir, path.basename(recipe.imageUrl));
        await fs.remove(oldPath).catch(() => {});
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = {
      ...recipe,
      title: req.body.title ?? recipe.title,
      description: req.body.description ?? recipe.description,
      categories,
      ingredients,
      instructions,
      imageUrl,
      updatedAt: new Date().toISOString(),
    };
    db.recipes[idx] = updated;
    await writeDb(db);
    res.json(publicRecipe(updated, db.users));
  } catch (err) {
    res.status(500).json({ message: 'Failed to update recipe' });
  }
});

// Delete Recipe
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const db = await readDb();
    const idx = db.recipes.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Recipe not found' });
    const recipe = db.recipes[idx];
    if (recipe.authorId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    // Remove image
    if (recipe.imageUrl) {
      const p = path.join(uploadsDir, path.basename(recipe.imageUrl));
      await fs.remove(p).catch(() => {});
    }
    // Remove from favorites of users
    db.users = db.users.map(u => ({
      ...u,
      favorites: (u.favorites || []).filter(id => id !== recipe.id),
    }));
    db.recipes.splice(idx, 1);
    await writeDb(db);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete recipe' });
  }
});

// Post a Comment
router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !String(text).trim()) return res.status(400).json({ message: 'Comment text required' });
    const db = await readDb();
    const recipe = db.recipes.find(r => r.id === req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    const comment = { id: uuidv4(), userId: req.user.id, userName: req.user.name, text: String(text).trim(), createdAt: new Date().toISOString() };
    recipe.comments.push(comment);
    recipe.updatedAt = new Date().toISOString();
    await writeDb(db);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post comment' });
  }
});

// Rate a Recipe
router.post('/:id/ratings', requireAuth, async (req, res) => {
  try {
    const { value } = req.body;
    const ratingValue = Number(value);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be 1-5' });
    }
    const db = await readDb();
    const recipe = db.recipes.find(r => r.id === req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    const existingIdx = recipe.ratings.findIndex(r => r.userId === req.user.id);
    if (existingIdx >= 0) {
      recipe.ratings[existingIdx].value = ratingValue;
    } else {
      recipe.ratings.push({ userId: req.user.id, value: ratingValue });
    }
    recipe.averageRating = computeAverageRating(recipe.ratings);
    recipe.updatedAt = new Date().toISOString();
    await writeDb(db);
    res.json({ averageRating: recipe.averageRating, ratingsCount: recipe.ratings.length, userRating: ratingValue });
  } catch (err) {
    res.status(500).json({ message: 'Failed to rate recipe' });
  }
});

// Toggle Favorite
router.post('/:id/favorite', requireAuth, async (req, res) => {
  try {
    const db = await readDb();
    const recipe = db.recipes.find(r => r.id === req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    const user = db.users.find(u => u.id === req.user.id);
    user.favorites = user.favorites || [];
    const has = user.favorites.includes(recipe.id);
    if (has) {
      user.favorites = user.favorites.filter(id => id !== recipe.id);
      recipe.favoritesCount = Math.max(0, (recipe.favoritesCount || 0) - 1);
    } else {
      user.favorites.push(recipe.id);
      recipe.favoritesCount = (recipe.favoritesCount || 0) + 1;
    }
    recipe.updatedAt = new Date().toISOString();
    await writeDb(db);
    res.json({ favorited: !has, favoritesCount: recipe.favoritesCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle favorite' });
  }
});

// Get My Favorites
router.get('/me/favorites', requireAuth, async (req, res) => {
  try {
    const db = await readDb();
    const user = db.users.find(u => u.id === req.user.id);
    const favorites = (user.favorites || [])
      .map(id => db.recipes.find(r => r.id === id))
      .filter(Boolean)
      .map(r => publicRecipe(r, db.users));
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch favorites' });
  }
});

export default router;

