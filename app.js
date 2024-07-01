import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index.js';
import loginRouter from './routes/login.js';
import scrapeRouter from './routes/scrape.js';
import authenticateToken from './middlewares/authMiddleware.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(path.resolve(), 'public')));

app.use('/login', loginRouter);

app.use(authenticateToken);

app.use('/', indexRouter);
app.use('/scrape', scrapeRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // If the request accepts JSON, respond with JSON containing the status code and error message
  if (req.accepts('json')) {
    res.status(err.status || 500).json({ error: err.message });
  } else {
    // If the request does not accept JSON, send a plain text response
    res.status(err.status || 500).send(err.message);
  }
});

export default app;