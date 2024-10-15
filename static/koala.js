!(function (t) {
  if (window.ko) return;
  (window.ko = []),
    [
      "identify",
      "track",
      "removeListeners",
      "open",
      "on",
      "off",
      "qualify",
      "ready",
    ].forEach(function (t) {
      ko[t] = function () {
        var n = [].slice.call(arguments);
        return n.unshift(t), ko.push(n), ko;
      };
    });
  var n = document.createElement("script");
  (n.async = !0),
    n.setAttribute(
      "src",
      "https://cdn.getkoala.com/v1/pk_97c9e8693615e1baf7e10b3779530209fd37/sdk.js",
    ),
    (document.body || document.head).appendChild(n);

  var img = document.createElement("img");
  img.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
  img.setAttribute(
    "src",
    "https://static.scarf.sh/a.png?x-pxid=c360275b-ee5f-4c2e-802f-0d092433f713",
  );
  (document.body || document.head).appendChild(img);
})();
