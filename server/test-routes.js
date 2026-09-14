const router = require("./routes/index");

console.log("Exported router type:", typeof router);
if (router && router.stack) {
  router.stack.forEach((layer, i) => {
    console.log(`${i}: path=${layer.regexp} route=${!!layer.route} name=${layer.name}`);
    if (layer.name === "router" && layer.handle.stack) {
      console.log(`  Sub-router stack for ${layer.name}:`);
      layer.handle.stack.forEach((subLayer, j) => {
        console.log(`    ${j}: path=${subLayer.regexp} route=${!!subLayer.route} name=${subLayer.name}`);
        if (subLayer.route) {
          console.log(`      methods: ${Object.keys(subLayer.route.methods)}`);
        }
      });
    }
  });
} else {
  console.log("No router stack found", router);
}
