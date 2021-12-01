const express = require('express');
const Game = require('../models/game');
const authenticate = require('../authenticate');
const cors = require('./cors');

const gameRouter = express.Router();