"""
URL configuration for bookstore project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from core.views import *
from django.conf.urls.static import static
from django.contrib.auth import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', index, name='home'),
    path('market/', market, name='market'),
    path('about/', about, name='about'),
    path('contact/', contact, name='contact'),
    path('login/', login, name='login'),
    path('logout/', logout_user, name='logout'),
    path('register/', register, name='register'),
    path('send_verification_code/', send_code_view, name='send_code'),
    path('register-user/', register_user, name='register_user'),
    path('get-book/<int:book_id>/', get_book, name='get_book'),
    path('add-to-cart/<int:book_id>/', add_to_cart, name='add_to_cart'),
    path('cart/update/<int:book_id>/', update_cart_quantity, name='update_cart_quantity'),
    path('cart/delete/<int:book_id>/', clear_cart_item, name='clear_cart_item')
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
