# ####oussama: Verify FAQ persistence, admin permissions, validation, and ordering.
from django.test import TestCase
from rest_framework.test import APIClient
from apps.users.models import User
from .models import FAQ


class FAQTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('faqadmin', 'faqadmin@example.com', 'TravelSafely392!')
        self.customer = User.objects.create_user('driver', 'driver@example.com', 'TravelSafely392!')
        self.published = FAQ.objects.create(question='Published?', answer='Yes.', order=1)
        self.hidden = FAQ.objects.create(question='Hidden?', answer='Draft.', active=False, order=2)

    def test_public_only_sees_published_faqs(self):
        response = self.client.get('/api/faqs/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['id'] for item in response.data['results']], [self.published.pk])
        self.assertEqual(self.client.get(f'/api/faqs/{self.hidden.pk}/').status_code, 404)

    def test_non_admin_cannot_mutate(self):
        for user in [None, self.customer]:
            self.client.force_authenticate(user=user)
            for method, path, payload in [
                ('post', '/api/faqs/', {'question': 'New?', 'answer': 'Answer'}),
                ('patch', f'/api/faqs/{self.published.pk}/', {'active': False}),
                ('delete', f'/api/faqs/{self.published.pk}/', {}),
                ('post', '/api/faqs/swap/', {'id_a': self.published.pk, 'id_b': self.hidden.pk}),
            ]:
                response = getattr(self.client, method)(path, payload, format='json')
                self.assertIn(response.status_code, [401, 403])
        self.assertEqual(FAQ.objects.count(), 2)

    def test_admin_create_edit_publish_swap_delete(self):
        self.client.force_authenticate(user=self.admin)
        self.assertEqual(len(self.client.get('/api/faqs/').data['results']), 2)
        created = self.client.post('/api/faqs/', {'question': 'New?', 'answer': 'Answer', 'order': 0}, format='json')
        self.assertEqual(created.status_code, 201, created.data)
        self.assertEqual(created.data['order'], 3)
        updated = self.client.patch(f"/api/faqs/{created.data['id']}/", {'answer': 'Changed', 'active': False}, format='json')
        self.assertEqual(updated.status_code, 200)
        self.assertFalse(updated.data['active'])
        swap = self.client.post('/api/faqs/swap/', {'id_a': self.published.pk, 'id_b': created.data['id']}, format='json')
        self.assertEqual(swap.status_code, 200)
        self.assertEqual(swap.data[0]['id'], created.data['id'])
        self.assertEqual(self.client.delete(f"/api/faqs/{created.data['id']}/").status_code, 204)

    def test_invalid_content_and_swap_leave_data_unchanged(self):
        self.client.force_authenticate(user=self.admin)
        for payload in [{'question': ' ', 'answer': 'Valid'}, {'question': 'Valid', 'answer': ' '}]:
            self.assertEqual(self.client.post('/api/faqs/', payload, format='json').status_code, 400)
        for payload in [{}, {'id_a': self.published.pk, 'id_b': self.published.pk}, {'id_a': self.published.pk, 'id_b': 999999}]:
            self.assertEqual(self.client.post('/api/faqs/swap/', payload, format='json').status_code, 400)
        self.published.refresh_from_db()
        self.assertEqual(self.published.order, 1)
        self.assertEqual(FAQ.objects.count(), 2)
