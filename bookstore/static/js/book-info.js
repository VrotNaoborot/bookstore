document.addEventListener('DOMContentLoaded', function () {
    const modal = document.getElementById('modal');
    const modalProductId = document.getElementById('modal-product-id');
    const closeButton = modal.querySelector('.close-button');
    const modalImage = modal.querySelector('.modal-image img');
    const modalName = modal.querySelector('.modal-name');
    const modalPrice = modal.querySelector('.modal-price');
    const modalArticle = modal.querySelector('.modal-article');
    const qtyInput = modal.querySelector('.qty-input');

    document.querySelectorAll('.card-book').forEach(card => {
        card.addEventListener('click', async function (e) {
            if (e.target.closest('.add-to-cart-btn')) return;

            const bookId = this.dataset.id;

            try {
                const response = await fetch(`/get-book/${bookId}/`);
                if (!response.ok) throw new Error('Ошибка при получении данных');

                const data = await response.json();

                modalProductId.value = bookId;
                modalImage.src = data.cover_image_url;
                modalName.textContent = data.title;
                modalPrice.innerHTML = `${data.price}<span class="rub">₽</span>`;
                modalArticle.textContent = `Артикул: ${data.article}`;
                qtyInput.value = 1;
                qtyInput.setAttribute('max', data.max_quantity);

                modal.style.display = 'flex';

                modal.dataset.id = bookId;

            } catch (err) {
                console.error('Ошибка:', err);
            }
        });
    });

    closeButton.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.querySelectorAll('.add-to-cart-btn:not(.in-cart)').forEach(button => {
        button.addEventListener('click', function (e) {
            console.log('add listener');
            const card = this.closest('.card-book');
            const bookId = card.dataset.id;
            const quantity = parseInt(qtyInput.value);

            if (isNaN(quantity) || quantity <= 0) {
                alert('Неверное количество товара');
                return;
            }

            console.log(`Добавляем товар с ID ${bookId} в корзину, количество: ${quantity}`); // отладка

            fetch('/add-to-cart/' + bookId + '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken'),
                },
                body: JSON.stringify({ quantity: quantity }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    modal.style.display = 'none';
                    document.getElementById('cart-item-count').textContent = data.total_items;
                } else {
                    throw new Error('Ошибка при добавлении товара в корзину');
                }
            })
            .catch(err => {
                console.error('Ошибка:', err);
                alert('Не удалось добавить товар в корзину');
            });
        });
    });

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
