document.addEventListener("DOMContentLoaded", function () {
  const cartIcon = document.querySelector('.cart-icon');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartClose = document.querySelector('.cart-close');

  if (cartIcon && cartOverlay) {
    cartIcon.addEventListener('click', function () {
      cartOverlay.style.display = 'flex';
    });

    cartClose.addEventListener('click', function () {
      cartOverlay.style.display = 'none';
    });

    document.addEventListener('click', function (e) {
      if (
        cartOverlay.style.display === 'flex' &&
        !cartOverlay.contains(e.target) &&
        !cartIcon.contains(e.target)
      ) {
        cartOverlay.style.display = 'none';
      }
    });
  }
});
