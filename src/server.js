// server.js  (frontend gateway)
const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Your backend URL
const BACKEND_URL =
    process.env.REQ_URL ||
    "https://dixiessystembackend-production.up.railway.app";

// Proxy all API routes
app.use(
    "/api",
    createProxyMiddleware({
        target: BACKEND_URL,
        changeOrigin: true,
        ws: true,
        pathRewrite: {
            "^/api": "", // ONLY remove the prefix — nothing more
        },
    })
);

// Serve React build
const buildPath = path.join(__dirname, "..", "build"); // CRA uses build/
app.use(express.static(buildPath));

// SPA fallback (must be LAST and must NOT use path params)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Frontend gateway listening on port ${port}`);
});
