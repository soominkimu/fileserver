// Simple File server
// https://adrianmejia.com/blog/2016/08/24/building-a-node-js-static-file-server-files-over-http-using-es6/
// Soomin K.

// Access to fetch at 'http://localhost:9001/fractal.wasm' from origin 'http://localhost:8080'
// has been blocked by CORS policy:
// No 'Access-Control-Allow-Origin' header is present on the requested resource.
// If an opaque response serves your needs, set the request's mode to 'no-cors'
// to fetch the resource with CORS disabled.

// ln -s /path_to_original /path_to_symlink
// ln -s ~/D/Python/csv2json/dataJSON ./dataJSON

const http  = require('http');
const url   = require('url');
const fs    = require('fs');
const path  = require('path');
const chalk = require('chalk');
// you can pass the parameter in the command line. e.g. node server.js 3000
const port = process.argv[2] || 9001;

// maps file extension to MIME types
const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.eot': 'appliaction/vnd.ms-fontobject',
  '.ttf': 'aplication/font-sfnt',
  '.wasm': 'application/wasm'
}

http.createServer((req, res) => {  // request, response
  console.log(chalk.blue(req.method), req.url);

  // parse URL
  const parsedUrl = url.parse(req.url);

  // extract URL path
  // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
  // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
  // by limiting the path to current directory only
  const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  let pathname = path.join(__dirname, sanitizePath);

  fs.stat(pathname, (err, _stats) => {  // exists deprecated
    // console.log(stats);
    if (err) {
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      console.log(chalk.red(`File ${pathname} not found!`));
      return;
    }

    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/index.html';
    }

    fs.readFile(pathname, (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
        console.log(chalk.red('Fail'), new Date());
      } else {
        const ext = path.parse(pathname).ext;
        res.setHeader('Content-type', mimeType[ext] || 'text/plain');
        // Website you wish to allow to connect
        res.setHeader('Access-Control-Allow-Origin', '*'); // 'http://localhost:8080'); // CORS
        // Request methods you wish to allow
        //res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        // Request headers you wish to allow
        //res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        // Set to true if you need the website to include cookies in the requests sent
        // to the API (e.g. in case you use sessions)
        //res.setHeader('Access-Control-Allow-Credentials', true);
        res.end(data);
        console.log(chalk.green('Success'), new Date());
      }
    });
  });
}).listen(parseInt(port));

console.log(chalk.yellow('Server listening on port ' + port), new Date());
console.log(chalk.green('Current Directory:') + process.cwd());
