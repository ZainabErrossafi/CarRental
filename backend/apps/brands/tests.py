from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from rest_framework.test import APIClient
from rest_framework import status

from .models import Brand

User = get_user_model()


# ==========================================
# MODEL TESTS
# ==========================================

class BrandModelTests(TestCase):

    def test_create_brand(self):
        brand = Brand.objects.create(name="Toyota")

        self.assertEqual(brand.name, "Toyota")
        self.assertEqual(brand.slug, "toyota")

    def test_slug_is_automatically_generated(self):
        brand = Brand.objects.create(name="Mercedes Benz")

        self.assertEqual(brand.slug, "mercedes-benz")

    def test_custom_slug_is_preserved(self):
        brand = Brand.objects.create(
            name="Mercedes",
            slug="mercedes-custom"
        )

        self.assertEqual(brand.slug, "mercedes-custom")

    def test_name_is_required(self):
        brand = Brand(name="")

        with self.assertRaises(ValidationError):
            brand.full_clean()

    def test_name_max_length(self):
        brand = Brand(name="A" * 101)

        with self.assertRaises(ValidationError):
            brand.full_clean()

    def test_name_accepts_100_characters(self):
        brand = Brand(name="A" * 100)
        brand.full_clean()

    def test_slug_accepts_empty_value(self):
        brand = Brand(name="Toyota", slug="")
        brand.full_clean()

    def test_slug_max_length(self):
        brand = Brand(
            name="Toyota",
            slug="a" * 121
        )

        with self.assertRaises(ValidationError):
            brand.full_clean()

    def test_slug_accepts_120_characters(self):
        brand = Brand(
            name="Toyota",
            slug="a" * 120
        )

        brand.full_clean()

    def test_name_must_be_unique(self):
        Brand.objects.create(name="Toyota")

        duplicate = Brand(name="Toyota")

        with self.assertRaises(ValidationError):
            duplicate.full_clean()

    def test_slug_must_be_unique(self):
        Brand.objects.create(
            name="Toyota",
            slug="toyota"
        )

        duplicate = Brand(
            name="Toyota 2",
            slug="toyota"
        )

        with self.assertRaises(ValidationError):
            duplicate.full_clean()

    def test_str_returns_brand_name(self):
        brand = Brand.objects.create(name="BMW")

        self.assertEqual(str(brand), "BMW")


# ==========================================
# API TESTS
# ==========================================

class BrandAPITests(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/brands/"

        # Regular user
        self.regular_user = User.objects.create_user(
            username="regular",
            email="regular@test.com",
            password="password123"
        )

        # Admin/staff user
        self.admin_user = User.objects.create_user(
            username="admin",
            email="admin@test.com",
            password="password123",
            is_staff=True
        )

        self.brand = Brand.objects.create(name="Toyota")

    # ---------- GET ----------

    def test_anyone_can_list_brands(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anyone_can_retrieve_brand(self):
        response = self.client.get(
            f"{self.url}{self.brand.pk}/"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ---------- POST VALIDATION ----------

    def test_name_is_required(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {"slug": "bmw"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_name_cannot_be_empty(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {"name": ""}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_name_cannot_exceed_100_characters(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {"name": "A" * 101}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_name_accepts_100_characters(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {"name": "A" * 100}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_duplicate_name_is_rejected(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {"name": "Toyota"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_slug_can_be_omitted(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {"name": "BMW"}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["slug"], "bmw")

    def test_slug_can_be_empty(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {
                "name": "Mercedes",
                "slug": ""
            }
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["slug"], "mercedes")

    def test_custom_slug_is_accepted(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {
                "name": "Mercedes",
                "slug": "custom-mercedes"
            }
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["slug"], "custom-mercedes")

    def test_slug_cannot_exceed_120_characters(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {
                "name": "BMW",
                "slug": "a" * 121
            }
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_slug_is_rejected(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {
                "name": "Toyota 2",
                "slug": "toyota"
            }
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # ---------- PUT / UPDATE ----------

    def test_regular_user_cannot_update_brand(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.put(
            f"{self.url}{self.brand.pk}/",
            {"name": "Updated Toyota"}
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_update_brand(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.put(
            f"{self.url}{self.brand.pk}/",
            {"name": "Updated Toyota"}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    # ---------- PERMISSIONS ----------

    def test_anonymous_user_cannot_create_brand(self):
        response = self.client.post(
            self.url,
            {"name": "BMW"}
        )

        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]
        )

    def test_regular_user_cannot_create_brand(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.post(
            self.url,
            {"name": "BMW"}
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_brand(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.post(
            self.url,
            {"name": "BMW"}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_regular_user_cannot_delete_brand(self):
        self.client.force_authenticate(user=self.regular_user)

        response = self.client.delete(
            f"{self.url}{self.brand.pk}/"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_delete_brand(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.delete(
            f"{self.url}{self.brand.pk}/"
        )

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
