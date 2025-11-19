const http = require('http');
const path = require('path');
const fs = require('fs');

const port = 8080;

const server = http.createServer((req, res) => {
    res.statusCode = 200;

    // routing - index
    if (req.url === "/" || req.url === "/index.html") {
        res.setHeader('Content-Type', 'text/html');
        return fs.createReadStream('./index.html').pipe(res);
    }

    // routing - login
    if (req.url === "/login") {
        res.setHeader('Content-Type', 'text/html');
        // TODO
        return res.end("<h2>Register (coming soon)</h2><a href='/'>Back</a>");
    }

    // routing - register
    if (req.url === "/register") {
        res.setHeader('Content-Type', 'text/html');
        // TODO
        return res.end("<h2>Login (coming soon)</h2><a href='/'>Back</a>");
    }

    // routing - dashboard
    if (req.url === "/dashboard") {
        res.setHeader('Content-Type', 'text/html');
        // TODO
        return res.end("<h2>Dashboard (coming soon)</h2><a href='/'>Back</a>");
    }

    // Fallback
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');
    res.end("Page not found");

});


server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
