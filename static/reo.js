!(function () {
  var e, t, n;
  ((e = "42f495c8c5244dd"),
    (t = function () {
      Reo.init({ clientID: e });
    }),
    ((n = document.createElement("script")).src =
      "https://static.reo.dev/" + e + "/reo.js"),
    (n.defer = !0),
    (n.onload = t),
    document.head.appendChild(n));
})();