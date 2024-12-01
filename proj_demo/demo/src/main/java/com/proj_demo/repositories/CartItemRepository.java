package com.proj_demo.repositories;

import com.proj_demo.models.CartItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends MongoRepository<CartItem, String> {
    /**
     * Find all cart items by the shopping cart ID.
     * 
     * @param shoppingCartId the ID of the shopping cart
     * @return list of cart items
     */
    List<CartItem> findByShoppingCartId(String shoppingCartId);

    /**
     * Find a specific cart item by shopping cart ID and product ID.
     * 
     * @param shoppingCartId the ID of the shopping cart
     * @param productId the ID of the product
     * @return the cart item if found, or null
     */
    CartItem findByShoppingCartIdAndProductId(String shoppingCartId, String productId);
}