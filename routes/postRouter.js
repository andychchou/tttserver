const express = require('express');
const Post = require('../models/post');
const authenticate = require('../authenticate');
const cors = require('./cors');

const postRouter = express.Router();

postRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Post.find()
    .populate('comments.author')
    .then(posts => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(posts);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Post.create(req.body)
    .then(post => {
        console.log('Post Created ', post);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(post);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /posts');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Post.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

postRouter.route('/:postId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Post.findById(req.params.postId)
    .populate('comments.author')
    .then(post => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(post);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /posts/${req.params.postId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Post.findByIdAndUpdate(req.params.postId, {
        $set: req.body
    }, { new: true })
    .then(post => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(post);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Post.findByIdAndDelete(req.params.postId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = postRouter;