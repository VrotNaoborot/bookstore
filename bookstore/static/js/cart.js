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

  document.querySelectorAll('.cart-item-remove').forEach(button => {
    button.addEventListener('click', function () {
      const cartItem = this.closest('.cart-item');
      const productId = cartItem.getAttribute('data-product-id');

      fetch(`/cart/delete/${productId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          cartItem.remove();  // Удаляем элемент из DOM
        } else {
          alert(data.error || "Не удалось удалить товар");
        }
      })
      .catch(error => {
        console.error("Ошибка удаления:", error);
        alert("Ошибка соединения с сервером");
      });
    });
  });

  // === Обработка изменения количества ===
  document.querySelectorAll('.cart-item').forEach(item => {
    const productId = item.dataset.productId;
    const minusBtn = item.querySelector('.qty-btn:first-of-type');
    const plusBtn = item.querySelector('.qty-btn:last-of-type');
    const qtyDisplay = item.querySelector('.qty-value');

    minusBtn.addEventListener('click', () => {
      let quantity = parseInt(qtyDisplay.textContent);
      if (quantity > 1) {
        updateCartQuantity(productId, quantity - 1, qtyDisplay);
        qtyDisplay.value = quantity - 1;
      }
    });

    plusBtn.addEventListener('click', () => {
      let quantity = parseInt(qtyDisplay.textContent);
      updateCartQuantity(productId, quantity + 1, qtyDisplay);
    });
  });

  function updateCartQuantity(productId, newQuantity, qtyDisplayElement) {
    fetch(`/cart/update/${productId}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({ quantity: newQuantity }),
    })
    .then(response => {
      if (response.ok) {
        qtyDisplayElement.textContent = newQuantity;
        // при необходимости можно пересчитать сумму и обновить её
      } else {
        alert("Ошибка обновления количества");
      }
    })
    .catch(error => {
      console.error("Ошибка:", error);
      alert("Ошибка соединения с сервером");
    });
  }

  // === Получение csrftoken ===
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
});
