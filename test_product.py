class ProductTests(TestCase):
    def setUp(self):
        # Product data for adding a product
        self.product_data = {
            "name": "T-shirt",
            "description": "A comfortable t-shirt",
            "price": 20.00,
            "category": "Clothing",
            "subCategory": "Men",
        }
        self.add_product_url = reverse("add_product")

    def test_add_product_success(self):
        response = self.client.post(self.add_product_url, self.product_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Product added successfully.")
        self.assertTrue(Product.objects.filter(name="T-shirt").exists())
