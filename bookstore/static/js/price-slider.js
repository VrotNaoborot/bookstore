document.addEventListener("DOMContentLoaded", function () {
    const rangeMin = document.getElementById("range-min");
    const rangeMax = document.getElementById("range-max");
    const minPrice = document.getElementById("min-price");
    const maxPrice = document.getElementById("max-price");
    const minGap = 100;

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
    }

    rangeMin.addEventListener("input", updateRange);
    rangeMax.addEventListener("input", updateRange);
});
