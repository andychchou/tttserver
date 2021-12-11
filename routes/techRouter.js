const express = require('express');
const Tech = require('../models/tech');
const authenticate = require('../authenticate');
const cors = require('./cors');

const techRouter = express.Router();

techRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Tech.find()
    .then(techs => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(techs);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Tech.create(req.body)
    .then(tech => {
        console.log('Tech Created ', tech);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(tech);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /techs');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Tech.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

techRouter.route('/:techId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Tech.findById(req.params.techId)
    .then(tech => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(tech);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /techs/${req.params.techId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Tech.findByIdAndUpdate(req.params.techId, {
        $set: req.body
    }, { new: true })
    .then(tech => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(tech);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Tech.findByIdAndDelete(req.params.techId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = techRouter;