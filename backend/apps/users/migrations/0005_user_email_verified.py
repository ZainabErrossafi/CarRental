# ####oussama: Track email verification without locking out existing accounts.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('users', '0004_email_two_factor')]
    operations = [migrations.AddField(model_name='user', name='email_verified', field=models.BooleanField(default=True))]
