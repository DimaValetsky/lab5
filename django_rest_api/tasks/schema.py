import graphene
from django.db.models import Q
from graphene_django.types import DjangoObjectType, ObjectType
from .models import Task


class TaskType(DjangoObjectType):
    class Meta:
        model = Task


class Query(ObjectType):
    task = graphene.Field(TaskType, id=graphene.Int())
    tasks = graphene.List(TaskType, status=graphene.String())
    def resolve_task(self, info, **kwargs):
        id = kwargs.get('id')
        if id is not None:
            return Task.objects.get(pk=id)
        return None

    def resolve_tasks(self, info, status=None, **kwargs):
        if status:
            filter = (
                    Q(status__icontains=status)
            )
            return Task.objects.filter(filter)
        return Task.objects.all()


class TaskInput(graphene.InputObjectType):
    id = graphene.ID()
    name = graphene.String()
    date = graphene.DateTime()
    status = graphene.String()


class CreateTask(graphene.Mutation):
    class Arguments:
        input = TaskInput(required=True)

    ok = graphene.Boolean()
    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(root, info, input=None):
        ok = True
        task_instance = Task(name=input.name, status=input.status, date=input.date)
        task_instance.save()
        return CreateTask(ok=ok, task=task_instance)


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.Int(required=True)
        input = TaskInput(required=True)

    ok = graphene.Boolean()
    task = graphene.Field(TaskType)

    @staticmethod
    def mutate(root, info, id, input=None):
        ok = False
        task_instance = Task.objects.get(pk=id)
        if task_instance:
            ok = True
            task_instance.name = input.name
            task_instance.status = input.status
            task_instance.save()
            return UpdateTask(ok=ok, task=task_instance)
        return UpdateTask(ok=ok, task=None)


class DeleteTask(graphene.Mutation):
    ok = graphene.Boolean()

    class Arguments:
        id = graphene.ID()

    @classmethod
    def mutate(cls, root, info, **kwargs):
        ok = True
        obj = Task.objects.get(pk=kwargs["id"])
        obj.delete()
        return DeleteTask(ok=ok)


class Mutation(graphene.ObjectType):
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
