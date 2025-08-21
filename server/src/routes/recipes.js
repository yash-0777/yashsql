import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Setup upload directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

// POST /api/recipes - Create a recipe
router.post('/', authenticate, upload.single('photo'), async (req, res) => {
  try {
    const { title, description, ingredients, instructions, category } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const ingredientsArr = Array.isArray(ingredients)
      ? ingredients
      : (ingredients || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
    const instructionsArr = Array.isArray(instructions)
      ? instructions
      : (instructions || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);

    const recipe = await Recipe.create({
      author: req.user.id,
      title,
      description,
      ingredients: ingredientsArr,
      instructions: instructionsArr,
      category,
      photoUrl,
    });
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/recipes - Fetch all recipes (with optional category filter)
router.get('/', async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
  res.json(recipes);
});

// GET /api/recipes/:id - Fetch a single recipe
router.get('/:id', async (req, res) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate('author', 'name')
    .populate('comments.user', 'name');
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  res.json(recipe);
});

// PUT /api/recipes/:id - Update a recipe (only by author)
router.put('/:id', authenticate, upload.single('photo'), async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  if (recipe.author.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not authorized' });

  const { title, description, ingredients, instructions, category } = req.body;
  if (title !== undefined) recipe.title = title;
  if (description !== undefined) recipe.description = description;
  if (ingredients !== undefined)
    recipe.ingredients = Array.isArray(ingredients)
      ? ingredients
      : ingredients
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
  if (instructions !== undefined)
    recipe.instructions = Array.isArray(instructions)
      ? instructions
      : instructions
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean);
  if (category !== undefined) recipe.category = category;
  if (req.file) recipe.photoUrl = `/uploads/${req.file.filename}`;
  await recipe.save();
  res.json(recipe);
});

// DELETE /api/recipes/:id - Delete a recipe (only by author)
router.delete('/:id', authenticate, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  if (recipe.author.toString() !== req.user.id)
    return res.status(403).json({ message: 'Not authorized' });
  await recipe.deleteOne();
  res.json({ success: true });
});

// POST /api/recipes/:id/comments - Add a comment to a recipe
router.post('/:id/comments', authenticate, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  const { text } = req.body;
  recipe.comments.push({ user: req.user.id, text });
  await recipe.save();
  const populated = await Recipe.findById(recipe._id)
    .populate('author', 'name')
    .populate('comments.user', 'name');
  res.status(201).json(populated);
});

// POST /api/recipes/:id/rating - Add/update rating and update average rating
router.post('/:id/rating', authenticate, async (req, res) => {
  const { value } = req.body;
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
  const idx = recipe.ratings.findIndex((r) => r.user.toString() === req.user.id);
  if (idx >= 0) {
    recipe.ratings[idx].value = value;
  } else {
    recipe.ratings.push({ user: req.user.id, value });
  }
  recipe.recalculateAverageRating();
  await recipe.save();
  res.json(recipe);
});

// POST /api/recipes/:id/favorite - Save recipe to user’s favorites (JWT auth)
router.post('/:id/favorite', authenticate, async (req, res) => {
  const recipeId = req.params.id;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const exists = user.favorites.find((id) => id.toString() === recipeId);
  if (!exists) user.favorites.push(recipeId);
  await user.save();
  res.json({ success: true });
});

export default router;