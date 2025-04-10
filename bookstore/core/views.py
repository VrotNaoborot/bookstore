from django.shortcuts import render


# Create your views here.


def index(requests):
    return render(requests, template_name="index.html")


def market(request):
    return render(request, template_name="market.html")


def about(request):
    return render(request, template_name="about.html")


def contact(request):
    return render(request, template_name="contact.html")
