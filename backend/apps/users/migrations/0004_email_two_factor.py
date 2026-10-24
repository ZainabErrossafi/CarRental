from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('users', '0003_alter_user_email')]

    operations = [
        migrations.AddField(model_name='user', name='two_factor_enabled', field=models.BooleanField(default=False)),
        migrations.AddField(model_name='user', name='two_factor_code', field=models.CharField(max_length=6, blank=True, null=True)),
        migrations.AddField(model_name='user', name='two_factor_code_created_at', field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name='user', name='two_factor_challenge', field=models.CharField(max_length=32, blank=True, default='')),
        migrations.AddField(model_name='user', name='two_factor_attempts', field=models.PositiveSmallIntegerField(default=0)),
    ]
