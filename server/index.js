// server/index.js

const express = require("express");
const path = require('path')
const fs = require('fs')
const logger = require('morgan')
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3000
const app = express();
const indexRoutes = require('./routes/indexRoutes')
const http = require('http');
const https = require('https');
// const privateKey  = fs.readFileSync('./key.pem', 'utf8');
// const certificate = fs.readFileSync('./server.crt', 'utf8');

// const credentials = {key: privateKey, cert: certificate};

// function requireHTTPS(req, res, next) {
//   console.log('req https')
//   if (!req.secure) {
//     console.log('not secure', 'host', req.headers.host, 'url', req.url);
//     return res.redirect('https://' + req.headers.host + req.url);
//   }
//   next();
// }

app.set('view engine', 'html')
app.engine('html', function (path, options, callback) {
  fs.readFile(path, 'utf-8', callback)
})
app.set('json spaces', 0)
// app.use(requireHTTPS);
app.use(express.static(path.join(__dirname, '../src')))
app.use(logger('dev'))
app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use(bodyParser.json())

app.enable('trust proxy')
// app.use((req, res, next) => {
//     req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
// })

// ROUTES //
app.use('/', indexRoutes)

app.get('*', (req, res, next) => {
  // always send index since we're using a react bundle:
  res.sendFile(path.join(__dirname, '../src/index.html'))
})

// ERROR HANDLER //
app.use(function (err, req, res, next) {
  console.log(err.stack)
  res.status(err.status || 500).end()
})

let port = PORT

// const httpServer = http.createServer(app);
// const httpsServer = https.createServer( credentials, app);

app.listen( port, function () {
  console.log('running at localhost:' + port)
})

// httpServer.listen(2000, function () {
//   console.log('running at localhost:' + 2000)
// })

// httpsServer.listen(port, function () {
//   console.log('running at localhost:' + port)
// })
