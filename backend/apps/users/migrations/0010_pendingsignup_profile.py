from django.db import migrations, models


def add_missing_profile_fields(apps, schema_editor):
    pending_signup = apps.get_model('users', 'PendingSignup')
    table = pending_signup._meta.db_table
    with schema_editor.connection.cursor() as cursor:
        columns = {
            column.name
            for column in schema_editor.connection.introspection.get_table_description(cursor, table)
        }
    # A previously applied migration on another branch may already own these columns.
    for name, max_length in [('first_name', 150), ('last_name', 150), ('phone', 20)]:
        if name not in columns:
            field = models.CharField(max_length=max_length, blank=True, default='')
            field.set_attributes_from_name(name)
            schema_editor.add_field(pending_signup, field)


class Migration(migrations.Migration):
    dependencies = [('users', '0009_passwordresetchallenge')]

    operations = [
        migrations.SeparateDatabaseAndState(
            # Irreversible: rolling back must not delete pre-existing profile data.
            database_operations=[migrations.RunPython(add_missing_profile_fields)],
            state_operations=[
                migrations.AddField(
                    model_name='pendingsignup', name='first_name',
                    field=models.CharField(max_length=150, blank=True),
                ),
                migrations.AddField(
                    model_name='pendingsignup', name='last_name',
                    field=models.CharField(max_length=150, blank=True),
                ),
                migrations.AddField(
                    model_name='pendingsignup', name='phone',
                    field=models.CharField(max_length=20, blank=True),
                ),
            ],
        ),
    ]
