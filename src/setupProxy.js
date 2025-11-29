// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
    const BACKEND_URL = "https://dixiessystembackend-production.up.railway.app";
    console.log("setupProxy loaded"); // this shows in the npm start terminal

    app.use(
        "/api",
        createProxyMiddleware({
            target: BACKEND_URL,
            changeOrigin: true,
            pathRewrite: { "^/api": "" },
            logLevel: "debug",
        })
    );
 
    app.use(
        "/socket.io",
        createProxyMiddleware({
            target: BACKEND_URL,
            changeOrigin: true,
            ws: true,           // websocket upgrades
            logLevel: "debug",  // verbose logs to troubleshoot
        })
    );
};
