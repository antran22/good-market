const toastElements = [].slice.call(document.querySelectorAll(".toast"));
toastElements.forEach(function (toastEl) {
  new bootstrap.Toast(toastEl, { delay: 4000, animation: true }).show();
});
