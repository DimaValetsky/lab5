from django.db import models


class Task(models.Model):
    name = models.CharField("Task name", max_length=100, unique=True)
    date = models.DateTimeField("Created at", auto_now_add=True)
    status = models.CharField("Task status", max_length=30)

    def __str__(self):
        return self.name
