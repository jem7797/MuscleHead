module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [...(api.env("production") ? ["transform-remove-console"] : [])],
  };
};
