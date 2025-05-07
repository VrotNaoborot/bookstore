import json
from django.shortcuts import render, redirect
from django.core.mail import send_mail
from django.core.exceptions import ValidationError
from django.http import JsonResponse, HttpResponse
from datetime import datetime, timedelta
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth.decorators import login_required
from bookstore import settings
import random
import string
from django.contrib import messages
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate, login as django_login, logout
from .models import *
from django.db.models import Min, Max

User = get_user_model()


def get_book(request, book_id):
    try:
        book = Book.objects.get(pk=book_id)
        return JsonResponse({
            'id': book.id,
            'title': book.title,
            'price': str(book.price),
            'article': book.id,
            'cover_image_url': book.cover_image.url,
            'max_quantity': book.quantity_in_stock,
        })
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Книга не найдена'}, status=404)


def index(request):
    bestseller_item = Book.objects.all()
    fake_books = [bestseller_item[0]] * 10  # временные данные

    cart_item_ids = set()
    cart_items = set()

    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            # print(f"CART: {cart.id}")
            cart_item_ids = set(cart.items.values_list('product_id', flat=True))
            cart_items = CartItem.objects.filter(cart=cart)
            # print(f"CART ITEMS: {cart_items}")
        except Exception as ex:
            print(ex)

    total_price_cart = sum([item.quantity * item.product.price for item in cart_items])

    context = {
        'bestsellers_items': fake_books,
        'recommended_items': fake_books,
        'cart_item_ids': cart_item_ids,
        'cart_items': cart_items,
        'total_price_cart': total_price_cart
    }
    for cart_item in cart_items:
        cart_item.total_price = cart_item.quantity * cart_item.product.price

    return render(request, "index.html", context)


def market(request):
    all_collections = Collection.objects.all()
    selected_collections = request.GET.getlist('collections')

    selected_min_price = request.GET.get('min_price')
    selected_max_price = request.GET.get('max_price')

    # print(f"MAX PRICE: {selected_max_price} | MIN PRICE: {selected_min_price}")

    books = Book.objects.all()
    cart_item_ids = set()
    cart_items = set()

    price_bounds = books.aggregate(
        min_price=Min('price'),
        max_price=Max('price')
    )

    if selected_min_price and selected_max_price:
        books = books.filter(price__gte=selected_min_price, price__lte=selected_max_price)

    if list(filter(None, selected_collections)):
        books = books.filter(collections__slug__in=selected_collections)

    if request.user.is_authenticated:
        try:
            cart = Cart.objects.get(user=request.user)
            cart_item_ids = set(cart.items.values_list('product_id', flat=True))
            cart_items = CartItem.objects.filter(cart=cart)
        except Exception as ex:
            print(ex)

    total_price_cart = 0

    for cart_item in cart_items:
        cart_item.total_price = cart_item.quantity * cart_item.product.price
        total_price_cart += cart_item.total_price

    context = {
        'all_collections': all_collections,
        'selected_collections': selected_collections,
        'books': books,
        'min_price': price_bounds['min_price'],
        'max_price': price_bounds['max_price'],
        'current_min_price': selected_min_price,
        'current_max_price': selected_max_price,
        'cart_item_ids': cart_item_ids,
        'cart_items': cart_items,
        'total_price_cart': total_price_cart,
    }
    return render(request, template_name="market.html", context=context)


def about(request):
    return render(request, template_name="about.html")


def contact(request):
    return render(request, template_name="contact.html")


def login(request):
    print(request.method)
    if request.method == 'POST':
        try:
            email = request.POST.get('email')
            password = request.POST.get('password')

            print(f"Email: {email} Password: {password}")

            user = authenticate(request, username=email, password=password)
            print(user)
            if user is not None:
                django_login(request, user)
                return redirect('/')
            else:
                return render(request, 'login.html', {"error": "Invalid login or password"})
        except Exception as ex:
            print(ex)
            return render(request, "login.html", {"error": ex})

    elif request.method == 'GET':
        return render(request, "login.html")


def logout_user(request):
    logout(request)
    return render(request, template_name='index.html')


def register(request):
    return render(request, template_name="register.html")


@require_POST
def send_code_view(request):
    email = json.loads(request.body).get('email')
    print(f"EMAIL: {email}")
    try:
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'status': 'error',
                'message': 'Этот email уже зарегистрирован'
            }, status=400)
        send_verification_code(request, email)
        return JsonResponse({'status': 'success', 'message': 'Код отправлен'})
    except ValidationError as e:
        return JsonResponse({'status': 'error', 'message': f'{str(e)}'}, status=400)


def send_verification_code(request, email):
    """
    Отправляет код подтверждения на указанный email и сохраняет его в сессии
    с временной меткой истечения срока действия.

    Args:
        request: HttpRequest объект
        email (str): Email адрес для отправки кода

    Returns:
        bool: True если отправка прошла успешно, False в случае ошибки

    Raises:
        ValidationError: Если email некорректен или сервер email недоступен
    """
    # Проверка валидности email
    if not email or '@' not in email:
        raise ValidationError("Некорректный email адрес")

    # Генерация 6-значного кода
    code = ''.join(random.choices(string.digits, k=6))

    # Установка времени истечения кода (10 минут)
    expiration_time = datetime.now() + timedelta(minutes=10)

    # Сохранение в сессии
    request.session['verification_data'] = {
        'code': code,
        'email': email,
        'expires_at': expiration_time.isoformat(),
        'attempts': 0
    }
    request.session.modified = True

    try:
        send_mail(
            subject='Ваш код подтверждения',
            message=f'Ваш код подтверждения: {code}\nКод действителен в течение 10 минут.',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        # В случае ошибки удаляем код из сессии
        if 'verification_data' in request.session:
            del request.session['verification_data']
        request.session.modified = True
        raise ValidationError(f"Ошибка отправки email: {str(e)}")


@require_POST
def register_user(request):
    email = request.POST.get('email')
    password = request.POST.get('password')
    verification_code = request.POST.get('verification_code')

    print(f"Email: {email} | Password: {password} | Code: {verification_code}")

    if not all([email, password, verification_code]):
        messages.error(request, 'Все поля обязательны для заполнения')
        print('Все поля обязательны для заполнения')
        return redirect('register')

    verification_data = request.session.get('verification_data')

    if not verification_data:
        messages.error(request, 'Сессия истекла или код не был запрошен')
        print('Сессия истекла или код не был запрошен')
        return redirect('register')

    if verification_data.get('email') != email:
        messages.error(request, 'Email не совпадает с указанным при запросе кода')
        print('Email не совпадает с указанным при запросе кода')
        return redirect('register')

    expires_at = datetime.fromisoformat(verification_data['expires_at'])
    if datetime.now() > expires_at:
        del request.session['verification_data']
        messages.error(request, 'Срок действия кода истек')
        print('Срок действия кода истек')
        return redirect('register')

    if verification_data.get('code') != verification_code:
        # Увеличиваем счетчик попыток
        verification_data['attempts'] = verification_data.get('attempts', 0) + 1
        request.session['verification_data'] = verification_data

        if verification_data['attempts'] >= 3:
            del request.session['verification_data']
            messages.error(request, 'Превышено количество попыток. Запросите новый код.')
            print("Превышено количество попыток. Запросите новый код.")
        else:
            messages.error(request, 'Неверный код подтверждения')
            print('Неверный код подтверждения')
        return redirect('register')

    try:
        user = User.objects.create_user(
            email=email,
            password=password,
            is_active=True,
            username=email
        )

        del request.session['verification_data']

        from django.contrib.auth import login
        login(request, user)

        messages.success(request, 'Регистрация успешно завершена!')
        print("Регистрация успешно завершена!")
        return redirect('home')

    except Exception as e:
        messages.error(request, f'Ошибка при создании пользователя: {str(e)}')
        print(f'Ошибка при создании пользователя: {str(e)}')
        return redirect('register')


@login_required
def add_to_cart(request, book_id):
    if request.method == 'POST':
        book = get_object_or_404(Book, id=book_id)

        quantity = int(request.POST.get('quantity', 1))

        cart, created = Cart.objects.get_or_create(user=request.user)

        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=book)

        cart_item.quantity += quantity
        cart_item.save()

        return JsonResponse({
            'success': True,
            'message': f'Товар {book.title} добавлен в корзину!',
            'cart_item_quantity': cart_item.quantity,
            'total_items': cart.items.count(),
        })

    return JsonResponse({'success': False, 'message': 'Некорректный запрос'}, status=400)


@require_POST
@login_required
def update_cart_quantity(request, book_id):
    try:
        data = json.loads(request.body)
        new_quantity = int(data.get('quantity'))
    except (ValueError, json.JSONDecodeError):
        return JsonResponse({'error': 'Невалидные данные'}, status=400)

    if new_quantity < 1:
        return JsonResponse({'error': 'Количество должно быть не меньше 1'}, status=400)

    try:
        book = Book.objects.get(id=book_id)
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(cart=cart, product=book)
    except (Book.DoesNotExist, Cart.DoesNotExist, CartItem.DoesNotExist):
        return JsonResponse({'error': 'Элемент корзины не найден'}, status=404)

    cart_item.quantity = new_quantity
    cart_item.save()

    return JsonResponse({
        'success': True,
        'quantity': cart_item.quantity,
        'price_for_one': cart_item.product.price,
        'total_price': cart_item.quantity * book.price
    })


@require_POST
@login_required
def clear_cart_item(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
        cart = Cart.objects.get(user=request.user)
        cart_item = CartItem.objects.get(cart=cart, product=book)
        cart_item.delete()
        return JsonResponse({'success': True})
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Товар не найден'}, status=404)
    except Cart.DoesNotExist:
        return JsonResponse({'error': 'Корзина не найдена'}, status=404)
    except CartItem.DoesNotExist:
        return JsonResponse({'error': 'Товар в корзине не найден'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
