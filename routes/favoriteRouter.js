const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');

const Favorites = require('../models/favorites');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route('/')
  .get(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('dishes')
      .populate('user')
      .then(favorite => {
        if (favorite === null) {
          err = new Error(`${req.user.username} has no favorites`);
          err.status = 404;
          return next(err);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      })
      .catch(err => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite === null) {
          Favorites.create(
            { user: req.user._id, dishes: req.body },
            (err, favorite) => {
              if (err) {
                err.status = 500;
                return next(err);
              } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              }
            }
          );
        } else {
          req.body.forEach(dish => favorite.dishes.push(dish));
          favorite.save().then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        }
      })
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndDelete({ user: req.user._id }).then(resp => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
    });
  });

favoriteRouter
  .route('/:dishId')
  .post(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(favorite => {
        if (favorite === null) {
          Favorites.create(
            { user: req.user._id, dishes: [{ _id: req.params.dishId }] },
            (err, favorite) => {
              if (err) {
                err.status = 500;
                return next(err);
              } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              }
            }
          );
        } else {
          favorite.dishes.push({ _id: req.params.dishId });
          favorite.save().then(favorite => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          });
        }
      })
      .catch(err => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(favorite => {
      if (favorite.dishes.id(req.params.dishId) !== null) {
        favorite.dishes.id(req.params.dishId).remove();
        favorite.save().then(
          favorite => {
            Favorites.findOne({ user: req.user._id })
              .populate('dishes')
              .populate('user')
              .then(favorite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
              });
          },
          err => next(err)
        );
      } else if (favorite == null) {
        err = new Error(`Dish ${req.params.dishId} not in favorites`);
        err.status = 404;
        return next(err);
      }
    });
  });
module.exports = favoriteRouter;
