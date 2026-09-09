from django.db import models

# Create your models here.
from django.db import models


class Offer(models.Model):
    class Status(models.TextChoices):
        DONE = "done", "Done"
        PROCESSING = "processing", "Processing"
        ERROR = "error", "Error"
        PENDING = "pending", "Pending"

    class Environment(models.TextChoices):
        PRODUCTION = "production", "Production"
        STAGING = "staging", "Staging"

    task_id = models.CharField(max_length=32, unique=True, db_index=True)
    offer_id = models.CharField(max_length=100, db_index=True)
    provider = models.CharField(max_length=100, db_index=True)
    expired_at = models.DateTimeField(null=True, blank=True)
    has_video_assets = models.BooleanField(default=False)
    environment = models.CharField(
        max_length=20, choices=Environment.choices, default=Environment.PRODUCTION
    )
    processing_datetime = models.DateTimeField(db_index=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )

    class Meta:
        ordering = ["-processing_datetime"]

    def __str__(self):
        return f"{self.task_id} - {self.offer_id}"