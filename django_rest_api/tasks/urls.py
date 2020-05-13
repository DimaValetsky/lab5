from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import TaskList, TaskDetail, Register

urlpatterns = [
    path('tasks/', TaskList.as_view(), name="task_list"),
    path('tasks/<int:pk>/', TaskDetail.as_view(), name="task_details"),
    path('register/', Register.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view()),
    path('token/refresh/', TokenRefreshView.as_view()),

]