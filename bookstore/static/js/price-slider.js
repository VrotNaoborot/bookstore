document.addEventListener("DOMContentLoaded", function () {
    const rangeMin = document.getElementById("range-min");
    const rangeMax = document.getElementById("range-max");
    const minPrice = document.getElementById("min-price");
    const maxPrice = document.getElementById("max-price");
    const minGap = 100;
    let timeout;

    // Функция обновления значений на слайдере
    function updateRange(event) {
        let minVal = parseInt(rangeMin.value);
        let maxVal = parseInt(rangeMax.value);

        if (maxVal - minVal < minGap) {
            if (event.target === rangeMin) {
                rangeMin.value = maxVal - minGap;
                minVal = parseInt(rangeMin.value);
            } else {
                rangeMax.value = minVal + minGap;
                maxVal = parseInt(rangeMax.value);
            }
        }

        minPrice.textContent = minVal;
        maxPrice.textContent = maxVal;

        // Задержка перед отправкой запроса
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            updateUrlWithFilters();
        }, 500); // 500ms — это время ожидания, можно увеличить/уменьшить по необходимости
    }

    rangeMin.addEventListener("input", updateRange);
    rangeMax.addEventListener("input", updateRange);

    // Коллекции
    document.querySelectorAll('input[name="collection"]').forEach(input => {
        input.addEventListener('change', () => {
            updateUrlWithFilters();
        });
    });

    // Функция для обновления URL с фильтрами
    function updateUrlWithFilters() {
        const url = new URL(window.location.href);

        // Коллекции
        const collections = [];
        document.querySelectorAll('input[name="collection"]:checked').forEach(input => {
            collections.push(input.value);
        });
        url.searchParams.set('collections', collections.join(','));

        // Цены
        url.searchParams.set('min_price', rangeMin.value);
        url.searchParams.set('max_price', rangeMax.value);

        // Обновляем URL
        window.history.pushState({}, '', url);

        // Делать запрос на сервер с новым URL
        window.location.href = url;
    }
});
