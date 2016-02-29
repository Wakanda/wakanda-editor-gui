let context = require.context("./templates", false, /^\.\/.*\.js$/);
let modules = context.keys().map(context);

export default modules;
