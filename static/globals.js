// this hack is needed for pdf.js.
// It has a piece of code that is doing eval if regeneratorRuntime is undefined ¯\_(ツ)_/¯
// which is restricted on dashboard
// try {
//   regeneratorRuntime = runtime;
// } catch (accidentalStrictMode) {
//   Function("r", "regeneratorRuntime = r")(runtime);
// }
window.regeneratorRuntime = {};
