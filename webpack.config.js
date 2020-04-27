/*
React,
Sass,
*/

//Imports
const webpack = require("webpack");
const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const {
    CleanWebpackPlugin
} = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const devMode = process.env.NODE_ENV !== "production";
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const {BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

// Optimize \ Minimize
const optimization = () => {
    const config = {
        splitChunks: {
            chunks: "all",
            cacheGroups: {
                        vendors: {
                          test: /[\\/]node_modules[\\/]/,
                          name: "vendors",                    
                        },
            }
        }
    };
    if(!devMode){
        config.minimizer = [
            new OptimizeCssAssetsPlugin(),
            new TerserPlugin({
              cache: true,
              parallel: true,
              }),
        ];
    };
    return config;
};

// How to display file name in dev or prod mode
const fileName = (path,ext) => {
   return devMode 
    ? `${path}/[name].${ext}` 
    : `${path}/[name].[hash].${ext}`;
};

// Work with css-loader\postcss-loader\sass-loader
const cssLoader = () => {
let loader = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
          hmr: devMode,
          importLoaders: 1,
          },
    },
    "css-loader",
    "postcss-loader",
    "sass-loader",
  ];
  return loader;
};
          
          

// Babel
const jsLoader = () => {
 const loaders = ["babel-loader"];
//  if (devMode) {
//      loaders.push("eslint-loader");
//  }
 return loaders;
};

// Add plugins
const newPlugins = () =>{
const base = [
    new HTMLWebpackPlugin({
        template: "./index.html",
        minify: {
            collapseWhitespace: !devMode
        }
    }),
    new CleanWebpackPlugin(),
    new CopyPlugin([
        { 
          from: path.resolve(__dirname, "src/assets/images"),
          to: path.resolve(__dirname, "dist/assets/images")
        }
      ]),
    new MiniCssExtractPlugin({
        filename: fileName("assets/styles","css"),
    }),
];

if (!devMode) {
    // Analize proj.
    base.push(new BundleAnalyzerPlugin());
}
return base;
};


module.exports = {
  resolve: {
    extensions: ["*", ".js", ".jsx"],
    alias: {
      Styles: path.resolve(__dirname, "src/assets/styles/"),
    }
  },
    context: path.resolve(__dirname, "src"),
    mode: "development",
    entry: {
      index: "./js/index.js",
    },
    output: {
        filename: fileName("js","js"),
        path: path.resolve(__dirname, "dist"),
    },
    optimization: optimization(),
    devServer: {
        port: 4200,
        hot: devMode,
        overlay : true
    },
    devtool: devMode ? "source-map" : "",
    plugins: newPlugins(),
    module: {
        rules: [
          {
            // sass loader
            test: /\.s(a|c)ss$/,
            oneOf: [
                {
                  test: /\.module\.s(a|c)ss$/,
                  use:  cssLoader()
                },
                {
                  use: cssLoader(),
                }
              ]
       
          }, 
          { 
            // react && babel loader
            test:/\.(js|jsx)$/, 
            exclude: /node_modules/, 
            use: jsLoader(),
          },
          { 
            // file loader
            test: /\.(png|svg|jpg|gif)$/,
            use: 
                { loader: "file-loader"}   
          },
          { 
            // font loader
            test: /\.(ttf|wof|wof2|eot)$/,
            use: 
                { loader: "file-loader"}
          }

        ]
      }
};