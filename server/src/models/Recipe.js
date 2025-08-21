import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const ratingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    value: { type: Number, min: 1, max: 5, required: true },
  },
  { timestamps: true }
);

const recipeSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    ingredients: [{ type: String, required: true }],
    instructions: [{ type: String, required: true }],
    category: { type: String, enum: ['Dessert', 'Dinner', 'Vegan', 'Breakfast', 'Lunch', 'Snack', 'Other'], default: 'Other' },
    photoUrl: { type: String },
    comments: [commentSchema],
    ratings: [ratingSchema],
    avgRating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

recipeSchema.methods.recalculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.avgRating = 0;
    return this.avgRating;
  }
  const sum = this.ratings.reduce((acc, r) => acc + r.value, 0);
  this.avgRating = Math.round((sum / this.ratings.length) * 10) / 10;
  return this.avgRating;
};

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;

