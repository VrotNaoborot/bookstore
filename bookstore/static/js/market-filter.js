function toggleFilter(header) {
    const content = header.nextElementSibling;
    const icon = header.querySelector('.toggle-icon');

    content.classList.toggle('hidden');
    icon.textContent = content.classList.contains('hidden') ? '+' : '−';
}

document.querySelectorAll('input[name="collection"]').forEach(input => {
  input.addEventListener('change', () => {
    document.getElementById('filtersForm').submit();
  });
});