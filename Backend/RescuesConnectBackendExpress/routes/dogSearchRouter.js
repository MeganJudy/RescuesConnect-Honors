const express = require('express');
const Dog = require('../models/dog');

const dogSearchRouter = express.Router();

dogSearchRouter.route('/')
    .get((req, res, next) => {
        Dog.find()
            .then(dogs => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dogs);
            })
            .catch(err => next(err));
    })
    .post((req, res, next) => {
        Dog.create(req.body)
            .then(dog => {
                console.log('Dog Profile Created ', dog);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dog);
            })
            .catch(err => next(err));
    })
    .put((req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /dogs');
    })
    .delete((req, res, next) => {
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
            .then(dog => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(dog);
            })
            .catch(err => next(err));
    })
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /dogs/${req.params.dogId}`);
    })
    .put((req, res, next) => {
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
    .delete((req, res, next) => {
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
    .post((req, res, next) => {
        Dog.findById(req.params.dogId)
            .then(dog => {
                if (dog) {
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
    .put((req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /dogs/${req.params.dogId}/comments`);
    })
    .delete((req, res, next) => {
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
    .post((req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /dogs/${req.params.dogId}/comments/${req.params.commentId}`);
    })
    .put((req, res, next) => {
        Dog.findById(req.params.dogId)
            .then(dog => {
                if (dog && dog.comments.id(req.params.commentId)) {
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
    .delete((req, res, next) => {
        Dog.findById(req.params.dogId)
            .then(dog => {
                if (dog && dog.comments.id(req.params.commentId)) {
                    dog.comments.id(req.params.commentId).remove();
                    dog.save()
                        .then(dog => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(dog);
                        })
                        .catch(err => next(err));
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
