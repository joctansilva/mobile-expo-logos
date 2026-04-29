module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      ["inline-import", { extensions: [".sql"] }],
      [
        "module-resolver",
        {
          root: ["."],
          alias: {
            "@": ".",
            "@features": "./features",
            "@db": "./db",
            "@lib": "./lib",
          },
        },
      ],
    ],
  };
};
