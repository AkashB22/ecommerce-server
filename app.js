var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let passport = require('passport');
require('./config/passport-config')();

let cors = require('cors');
let csrf = require('csurf');
let csrfProtection = csrf({cookie: true});
let expressSession = require('express-session');
let MongoStore = require('connect-mongo')(expressSession);
let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/ecommerce', {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
  });

let db = mongoose.connection;

db.on('error', (err)=>{
  console.log(err);
});

db.once('open', ()=>{
  console.log('db is connected');
});

var indexRouter = require('./routes/indexRouter');
var usersRouter = require('./routes/usersRouter');
let productsRouter = require('./routes/productsRouter');
let cartsRouter = require('./routes/cartsRouter');
let ordersRouter = require('./routes/ordersRouter');
let redisCacheTestApiRouter = require('./routes/redisCacheTestApiRouter');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let options = {
  mongooseConnection: mongoose.connection,
  ttl: 10,
  secret: 'mongoStoreSecret'
}

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: 'sessionSecret',
  store: new MongoStore(options)
}));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/carts', cartsRouter);
app.use('/orders', ordersRouter);
app.use('/redis', redisCacheTestApiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
