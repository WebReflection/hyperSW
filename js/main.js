// as soon as possible (deferred behavior)
document.addEventListener(
  'DOMContentLoaded',
  function () {
    // grab the main node and show some dynamic content!
    var render = hyperHTML.bind(document.querySelector('main'));
    update(render);
    setInterval(update, 1000, render);
    function update(render) {
      render`
      <p>
        You gotta admit this is awesome!
      </p>
      <p>
        ${new Date().toLocaleTimeString()}
      </p>`;
    }
  },
  {once: true}
);