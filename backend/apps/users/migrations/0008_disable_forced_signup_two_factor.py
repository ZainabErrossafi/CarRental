from django.db import migrations


def disable_forced_signup_two_factor(apps, schema_editor):
    User = apps.get_model('users', 'User')
    # Completed client sign-ups previously had two_factor_enabled forced on.
    User.objects.filter(role='client', two_factor_enabled=True).update(two_factor_enabled=False)


class Migration(migrations.Migration):
    dependencies = [('users', '0007_passwordchange')]

    operations = [
        migrations.RunPython(disable_forced_signup_two_factor, migrations.RunPython.noop),
    ]
