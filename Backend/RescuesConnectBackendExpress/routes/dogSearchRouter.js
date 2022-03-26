const express = require('express');
const Dog = require('../models/dog');
const authenticate = require("../authenticate");

const dogSearchRouter = express.Router();

dogSearchRouter.route('/')
    .get((req, res, next) => {
        Dog.find()
            .populate('comments.author')
            .then(dogs => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dogs);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dog.create(req.body)
            .then(dog => {
                console.log('Dog Profile Created ', dog);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dog);
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dogs');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dog.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

dogSearchRouter.route('/:dogId')
    .get((req, res, next) => {
        Dog.findById(req.params.dogId)
            .populate('comments.author')
            .then(dog => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dog);
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /dogs/${req.params.dogId}`);
    })
    .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dog.findByIdAndUpdate(req.params.dogId, {
            $set: req.body
        }, { new: true })
            .then(dog => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dog);
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dog.findByIdAndDelete(req.params.dogId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

dogSearchRouter.route('/:dogId/comments')
    .get((req, res, next) => {
        Dog.findById(req.params.dogId)
            .populate('comments.author')
            .then(dog => {
                if (dog) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dog.comments);
                } else {
                    err = new Error(`Dog ${req.params.dogId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        Dog.findById(req.params.dogId)
            .then(dog => {
                if (dog) {
                    req.body.author = req.user._id;
                    dog.comments.push(req.body);
                    dog.save()
                        .then(dog => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dog);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Dog ${req.params.dogId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /dogs/${req.params.dogId}/comments`);
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Dog.findById(req.params.dogId)
            .then(dog => {
                if (dog) {
                    for (let i = (dog.comments.length - 1); i >= 0; i--) {
                        dog.comments.id(dog.comments[i]._id).remove();
                    }
                    dog.save()
                        .then(dog => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dog);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Dog ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

dogSearchRouter.route('/:dogId/comments/:commentId')
    .get((req, res, next) => {
        Dog.findById(req.params.dogId)
            .populate('comments.author')
            .then(dog => {
                if (dog && dog.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dog.comments.id(req.params.commentId));
                } else if (!dog) {
                    err = new Error(`Dog ${req.params.dogId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(authenticate.verifyUser, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /dogs/${req.params.dogId}/comments/${req.params.commentId}`);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Dog.findById(req.params.dogId)
            .then(dog => {
                if (dog && dog.comments.id(req.params.commentId)) {
                    if (dogs.comments.id(req.params.commentId).author._id.equals(req.user.id)) {
                        if (req.body.rating) {
                            dog.comments.id(req.params.commentId).rating = req.body.rating;
                        }
                        if (req.body.text) {
                            dog.comments.id(req.params.commentId).text = req.body.text;
                        }
                        dog.save()
                            .then(dog => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dog);
                            })
                            .catch(err => next(err));
                    } else {
                        err = new Error(`You're not authorized to update this comment`);
                        err.status = 404;
                        return next(err);
                    }
                } else if (!dog) {
                    err = new Error(`Dog ${req.params.dogId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        Dog.findById(req.params.dogId)
            .then(dog => {
                if (dog && dog.comments.id(req.params.commentId)) {
                    if (dogs.comments.id(req.params.commentId).author._id.equals(req.user.id)) {
                        dog.comments.id(req.params.commentId).remove();
                        dog.save()
                            .then(dog => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(dog);
                            })
                            .catch(err => next(err));
                    } else {
                        err = new Error(`You're not authorized to delete this comment`);
                        err.status = 404;
                        return next(err);
                    }
                } else if (!dog) {
                    err = new Error(`Dog ${req.params.dogId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });


module.exports = dogSearchRouter;
