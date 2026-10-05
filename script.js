(function() {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  document.documentElement.classList.add("js");

  var t = document.getElementById("typed"),
      full = t.textContent,
      o1 = document.getElementById("o1"),
      o2 = document.getElementById("o2");

  o1.classList.remove("on");
  o2.classList.remove("on");
  t.textContent = "";

  var i = 0;

  function type() {
    if (i < full.length) {
      t.textContent += full.charAt(i++);
      setTimeout(type, 70);
    } else {
      setTimeout(function() {
        o1.classList.add("on");
        setTimeout(function() {
          o2.classList.add("on");
        }, 350);
      }, 250);
    }
  }

  setTimeout(type, 300);
})();