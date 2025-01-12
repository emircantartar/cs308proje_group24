class SalesManagerLoginTests(TestCase):
    def setUp(self):
        # Sales Manager login data
        self.sales_manager_data = {
            "email": "sales@example.com",
            "password": "sales123"
        }
        self.login_url = reverse("login")  # Login URL'sini burada belirtmelisiniz

    def test_sales_manager_login_success(self):
        response = self.client.post(self.login_url, self.sales_manager_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertIn("role", response.data)
        self.assertEqual(response.data["role"], "sales_manager")
        self.assertEqual(response.data["message"], "Login successful")
