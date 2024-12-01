package com.proj_demo.utils;

import com.proj_demo.models.Product;

import java.util.List;
import java.util.stream.Collectors;

public class SearchUtil {

    /**
     * Filters products by a search query in their name or description.
     *
     * @param products List of products to filter.
     * @param query    The search query.
     * @return A list of products matching the search query.
     */
    public static List<Product> searchProducts(List<Product> products, String query) {
        if (products == null || query == null || query.isBlank()) {
            return products; // Return all products if the list is null or query is empty
        }

        String lowerCaseQuery = query.toLowerCase();

        return products.stream()
                .filter(product ->
                        (product.getName() != null && product.getName().toLowerCase().contains(lowerCaseQuery)) ||
                        (product.getDescription() != null && product.getDescription().toLowerCase().contains(lowerCaseQuery)))
                .collect(Collectors.toList());
    }

    /**
     * Sorts a list of products by a specified attribute and order.
     *
     * @param products List of products to sort.
     * @param sortBy   Attribute to sort by ("price", "popularity", etc.).
     * @param order    Sorting order ("asc" or "desc").
     * @return A sorted list of products.
     */
    public static List<Product> sortProducts(List<Product> products, String sortBy, String order) {
        if (products == null || sortBy == null || sortBy.isBlank()) {
            return products; // Return unsorted if no criteria is specified
        }

        boolean ascending = "asc".equalsIgnoreCase(order);

        return products.stream()
                .sorted((p1, p2) -> {
                    switch (sortBy.toLowerCase()) {
                        case "price":
                            return ascending ?
                                    Double.compare(p1.getPrice(), p2.getPrice()) :
                                    Double.compare(p2.getPrice(), p1.getPrice());
                        case "popularity":
                            return ascending ?
                                    Double.compare(p1.getAverageRating(), p2.getAverageRating()) :
                                    Double.compare(p2.getAverageRating(), p1.getAverageRating());
                        case "name":
                            return ascending ?
                                    p1.getName().compareToIgnoreCase(p2.getName()) :
                                    p2.getName().compareToIgnoreCase(p1.getName());
                        default:
                            return 0; // No sorting if criteria is invalid
                    }
                })
                .collect(Collectors.toList());
    }
}