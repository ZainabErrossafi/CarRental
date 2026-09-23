# Import Django's tools for creating database models and fields.
from django.db import models

# Import a function that converts text into a URL-friendly format.
from django.utils.text import slugify


# Create a Brand model.
# Inheriting from models.Model tells Django that this class represents a database table.
class Brand(models.Model):

    # Create a text field called "name"
    name = models.CharField(max_length=100, unique=True)

    # Create a field for storing a URL-friendly version of the brand name
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    # Define how a Brand object should be displayed as text
    def __str__(self):
        # Return the brand's name instead of a generic representation.
        # For example, Django will display "Toyota" instead of "Brand object (1)".
        return self.name

    # Override Django's default save() method to add our own behavior
    # self refers to the current Brand object
    # *args and **kwargs allow the method to accept additional arguments
    def save(self, *args, **kwargs):

        # Check whether the slug is empty.
        if not self.slug:

            # Generate a URL-friendly slug from the brand's name.
            # Example: "Mercedes-Benz" becomes "mercedes-benz".
            self.slug = slugify(self.name)

        # Call Django's original save() method to save the object to the database
        # Passing args and kwargs preserves any additional save() arguments
        super().save(*args, **kwargs)
