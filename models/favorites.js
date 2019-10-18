const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoritesSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'User'
    },
    dishes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        unique: true,
        ref: 'Dish'
      }
    ]
  },
  { timestamps: true }
);

const Favorites = mongoose.model('Favorite', favoritesSchema);

module.exports = Favorites;
