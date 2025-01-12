class ProductUpdateTests(TestCase):
    def setUp(self):
        # Create Product for updating
        self.product = Product.objects.create(
            name="Old T-shirt",
            description="Outdated design",
            price=15.00,
            category="Clothing",
            subCategory="Men"
        )
        self.update_product_url = reverse("update_product", kwargs={"id": self.product.id})
        self.updated_data = {
            "name": "Updated T-shirt",
            "description": "New design",
            "price": 25.00,
            "category": "Clothing",
            "subCategory": "Men"
        }

    def test_update_product_success(self):
        response = self.client.put(self.update_product_url, self.updated_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Product updated successfully.")
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, "Updated T-shirt")
        self.assertEqual(self.product.description, "New design")
        self.assertEqual(self.product.price, 25.00)
