class CategoryTests(TestCase):
    def setUp(self):
        # Create a Category
        self.category = Category.objects.create(
            name="Clothing",
            description="Various types of clothing"
        )
        self.get_category_url = reverse("get_category", kwargs={"name": "Clothing"})

    def test_get_category_success(self):
        response = self.client.get(self.get_category_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["category"]["name"], "Clothing")
        self.assertEqual(response.data["category"]["description"], "Various types of clothing")
