// === КАУНТЕР ===
document.querySelectorAll('.quantity-selector').forEach(selector => {
  const minusBtn = selector.querySelector('.minus');
  const plusBtn = selector.querySelector('.plus');
  const input = selector.querySelector('.qty-input');

  minusBtn.addEventListener('click', () => {
  console.log("навешиваем события на каунтер -");
    let value = parseInt(input.value);
    if (value > 1) {
      input.value = value - 1;
    }
  });

  plusBtn.addEventListener('click', () => {
  console.log("навешиваем события на каунтер +");

    let value = parseInt(input.value);
    input.value = value + 1;
  });
});

// === МОДАЛКА ===
function openModal() {
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

// Закрытие по клику вне модального окна
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeModal();
  }
});
