class ProductDeletionTests(TestCase):
    def setUp(self):
        # Create Product for deletion
        self.product = Product.objects.create(
            name="Old T-shirt",
            description="Outdated design",
            price=15.00,
            category="Clothing",
            subCategory="Men"
        )
        self.delete_product_url = reverse("delete_product", kwargs={"id": self.product.id})

    def test_delete_product_success(self):
        response = self.client.delete(self.delete_product_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Product deleted successfully.")
        self.assertFalse(Product.objects.filter(name="Old T-shirt").exists())
