# Generated by Django 5.2 on 2025-04-12 21:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='book',
            name='cover_image',
            field=models.ImageField(blank=True, help_text='Изображение обложки', null=True, upload_to='books/covers/', verbose_name='Обложка книги'),
        ),
    ]
