package com.sabanciuniv.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "clients")
public class Client extends User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long clientId;

    @Column(nullable = false)
    private String address;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "wishlist_id")
    private WishList wishlist;

    // Constructors
    public Client() {}

    public Client(long userId, long taxId, String name, String email, String password, String address) {
        setUserId(userId);
        setTaxId(taxId);
        setName(name);
        setEmail(email);
        setPassword(password);
        this.address = address;
        this.wishlist = null; // initialize wishlist as null or create a new WishList if needed
        setRole("Client");
    }

    // Getters and Setters
    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public WishList getWishlist() {
        return wishlist;
    }

    public void setWishlist(WishList wishlist) {
        this.wishlist = wishlist;
    }
}
