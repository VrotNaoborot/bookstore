from django.db import models
from django.contrib.auth import get_user_model
from django.db import models
from django.core.validators import MinValueValidator

User = get_user_model()


class Book(models.Model):
    title = models.CharField(
        max_length=255,
        verbose_name="Название книги",
        help_text="Введите полное название книги"
    )
    quantity_in_stock = models.PositiveIntegerField(
        verbose_name="Количество на складе",
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Не может быть отрицательным"
    )
    quantity_sold = models.PositiveIntegerField(
        verbose_name="Продано экземпляров",
        default=0,
        help_text="Общее количество проданных экземпляров"
    )
    price = models.IntegerField(
        verbose_name="Цена",
        validators=[MinValueValidator(0)],
        help_text="Цена в рублях"
    )
    cover_image = models.ImageField(
        verbose_name="Обложка книги",
        upload_to='books/covers/',
        blank=True,
        null=True,
        help_text="Изображение обложки"
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Дата добавления"
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name="Дата последнего обновления"
    )

    class Meta:
        verbose_name = "Книга"
        verbose_name_plural = "Книги"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} (ID: {self.id})"

    def save(self, *args, **kwargs):
        """Дополнительная валидация при сохранении"""
        if self.quantity_in_stock < 0:
            raise ValueError("Количество на складе не может быть отрицательным")
        if self.price < 0:
            raise ValueError("Цена не может быть отрицательной")
        super().save(*args, **kwargs)


class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart пользователя {self.user}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Book, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.product.title} — {self.quantity} шт."
