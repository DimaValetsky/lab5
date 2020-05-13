from rest_framework import serializers
from .models import Task

from django_restql.mixins import DynamicFieldsMixin
from django.contrib.auth.models import User


class TaskSerializer(DynamicFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'name', 'status', 'date', 'file')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
