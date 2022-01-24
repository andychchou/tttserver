var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
const passport = require('passport');
const config = require('./config');
const socketio = require('socket.io');
const socketServer = require('./socketServer');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const gameRouter = require('./routes/gameRouter');
const postRouter = require('./routes/postRouter');
const commentRouter = require('./routes/commentRouter');
const technoRouter = require('./routes/technoRouter');
const promotionRouter = require('./routes/promotionRouter');
const feedbackRouter = require('./routes/feedbackRouter');

const mongoose = require('mongoose');

const url = config.mongoUrl;
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected to server'),
    err => console.log(err)
);

var app = express();

// Secure traffic only
// app.all('*', (req, res, next) => {
//     if (req.secure) {
//         return next();
//     } else {
//         console.log(`Redirecting to: https://${req.hostname}:${app.get('secPort')}${req.url}`);
//         res.redirect(301, `https://${req.hostname}:${app.get('secPort')}${req.url}`);
//     }
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());

app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use(express.static(path.join(__dirname, 'public')));

// use routers with respective routes
app.use('/games', gameRouter);
app.use('/posts', postRouter);
app.use('/comments', commentRouter);
app.use('/technos', technoRouter);
app.use('/promotions', promotionRouter);
app.use('/feedbacks', feedbackRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    // res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// to use for regular server
var server = http.createServer(app);
const port = process.env.PORT || 3000;

// Socket Setup
const io = socketio(server);
// Runs when client connects
io.on('connection', socket => {
  //console.log('New WS Connection...');
  socketServer(io, socket)
});


// for console.log
server.listen(port, () => console.log(`Server running on port ${port}`));

// to use for deployment
// server.listen(port,{origins: '*:*'});

// module.exports = app;
