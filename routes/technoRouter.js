const express = require('express');
const Techno = require('../models/techno');
const authenticate = require('../authenticate');
const cors = require('./cors');

const technoRouter = express.Router();

technoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Techno.find()
    .then(technos => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(technos);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Techno.create(req.body)
    .then(techno => {
        console.log('Techno Created ', techno);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(techno);
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /technos');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Techno.deleteMany()
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

technoRouter.route('/:technoId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Techno.findById(req.params.technoId)
    .then(techno => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(techno);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.statusCode = 403;
    res.end(`POST operation not supported on /technos/${req.params.technoId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Techno.findByIdAndUpdate(req.params.technoId, {
        $set: req.body
    }, { new: true })
    .then(techno => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(techno);
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Techno.findByIdAndDelete(req.params.technoId)
    .then(response => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
    })
    .catch(err => next(err));
});

module.exports = technoRouter;