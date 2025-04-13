// === КАУНТЕР ===
document.querySelectorAll('.quantity-selector').forEach(selector => {
  const minusBtn = selector.querySelector('.minus');
  const plusBtn = selector.querySelector('.plus');
  const input = selector.querySelector('.qty-input');

  minusBtn.addEventListener('click', () => {
    let value = parseInt(input.value);
    if (value > 1) {
      input.value = value - 1;
    }
  });

  plusBtn.addEventListener('click', () => {
    let value = parseInt(input.value);
    input.value = value + 1;
  });
});



function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Закрытие по клику вне модального окна
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeModal();
  }
});

// === ДОБАВЛЕНИЕ В КОРЗИНУ ИЗ МОДАЛКИ ===
document.querySelector('.modal .add-to-cart').addEventListener('click', function () {
  const modal = document.getElementById('modal');
  const quantityInput = modal.querySelector('.qty-input');
  const quantity = parseInt(quantityInput.value);
  const productId = document.getElementById('modal-product-id').value;

  if (!productId || isNaN(quantity) || quantity <= 0) {
    alert('Ошибка при добавлении товара');
    return;
  }

  fetch(`/add-to-cart/${productId}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({ quantity: quantity }),
  })
    .then(response => {
      if (response.ok) {
        alert('Товар добавлен в корзину');
        closeModal();
        // Можно обновить UI: кнопку на карточке и т.д.
      } else {
        throw new Error('Ошибка при добавлении товара в корзину');
      }
    })
    .catch(error => {
      console.error('Ошибка:', error);
      alert('Не удалось добавить товар в корзину');
    });
});

// === ПОЛУЧЕНИЕ CSRF ===
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Начинается ли cookie с нужного имени?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
