const express = require('express');
const Feedback = require('../models/feedback');
const authenticate = require('../authenticate');
const cors = require('./cors');

const feedbackRouter = express.Router();

feedbackRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Feedback.find()
    .then(feedbacks => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedback.create(req.body)
    .then(feedback => {
        console.log('Feedback Created ', feedback);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /feedbacks');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedback.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

feedbackRouter.route('/:feedbackId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Feedback.findById(req.params.feedbackId)
    .then(feedback => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /feedbacks/${req.params.feedbackId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedback.findByIdAndUpdate(req.params.feedbackId, {
        $set: req.body
    }, { new: true })
    .then(feedback => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedback.findByIdAndDelete(req.params.feedbackId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = feedbackRouter;