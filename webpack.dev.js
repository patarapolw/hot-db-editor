const common = require("./webpack.common");
const path = require("path");

module.exports = {
    ...common,
    mode: "development",
    devtool: "inline-source-map",
    devServer: {
        contentBase: path.join(__dirname, "public"),
        watchContentBase: true,
        open: true,
        proxy: {
            "/api": "http://localhost:5000"
        }
    }
};
