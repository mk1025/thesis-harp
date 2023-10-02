function includeScript(path) {
  let node = document.createElement("script"),
    okHandler,
    errHandler;

  node.src = path;

  okHandler = function() {
    this.removeEventListener("load", okHandler);
    this.removeEventListener("error", errHandler);
  };
  errHandler = function(error) {
    this.removeEventListener("load", okHandler);
    this.removeEventListener("error", errHandler);
  };

  node.addEventListener("load", okHandler);
  node.addEventListener("error", errHandler);

  document.body.appendChild(node);
}
