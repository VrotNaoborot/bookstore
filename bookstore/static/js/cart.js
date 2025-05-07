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

  // === Обработка удаления (вынесено в отдельную функцию) ===
  function deleteCartItem(productId, cartItemElement) {
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
        cartItemElement.remove();
      } else {
        alert(data.error || "Не удалось удалить товар");
      }
      recalculateCartTotal();
    })
    .catch(error => {
      console.error("Ошибка удаления:", error);
//      alert("Ошибка соединения с сервером");
    });
  }

  // === Назначение обработчиков на кнопки удаления ===
  document.querySelectorAll('.cart-item-remove').forEach(button => {
    button.addEventListener('click', function () {
      const cartItem = this.closest('.cart-item');
      const productId = cartItem.getAttribute('data-product-id');
      deleteCartItem(productId, cartItem);
      recalculateCartTotal();
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
      } else {
        // если было 1, и нажали минус — удаляем товар
        deleteCartItem(productId, item);
      }
      recalculateCartTotal();
    });

    plusBtn.addEventListener('click', () => {
      let quantity = parseInt(qtyDisplay.textContent);
      updateCartQuantity(productId, quantity + 1, qtyDisplay);
      recalculateCartTotal();
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
      if (!response.ok) {
        throw new Error("Ошибка ответа от сервера");
      }
      return response.json(); // <- вот этого не хватало
    })
    .then(data => {
      qtyDisplayElement.textContent = data.quantity;

      const cartItemElement = qtyDisplayElement.closest('.cart-item');

      const priceElement = cartItemElement.querySelector('.cart-item-price');
      if (priceElement) {
        priceElement.textContent = `${data.price_for_one} ₽`;
      }

      const totalElement = cartItemElement.querySelector('.cart-item-total');
      if (totalElement) {
        totalElement.textContent = `${data.total_price} ₽`;
      }
      recalculateCartTotal();
    })
    .catch(error => {
      console.error("Ошибка:", error);
      alert("Ошибка соединения с сервером");
    });
  }

  function recalculateCartTotal() {
    let total = 0;
    document.querySelectorAll('.cart-item').forEach(item => {
      const priceElement = item.querySelector('.cart-item-price');
      const qtyElement = item.querySelector('.qty-value');

      if (priceElement && qtyElement) {
        // Убираем ₽ и пробелы, приводим к float
        const price = parseFloat(priceElement.textContent.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        const quantity = parseInt(qtyElement.textContent) || 0;
        total += price * quantity;
      }
    });

    const totalElement = document.getElementById('cartTotalPrice');
    if (totalElement) {
      totalElement.textContent = `${total} ₽`;
    }
  }

//  function formatPrice(value) {
//    return parseFloat(value).toFixed(2).replace('.', ',');
//  }



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
