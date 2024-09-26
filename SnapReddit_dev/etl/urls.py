from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("snap_shot", views.snap_shot, name="snap_shot"),
]