package com.sabanciuniv.demo.model;
package com.sabanciuniv.demo.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "payment_id", referencedColumnName = "paymentId")
    private Payment payment;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Temporal(TemporalType.TIMESTAMP)
    private Date orderDate;

    private double totalPrice;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cart_id", referencedColumnName = "cartId")
    private CartItem myCart;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status; // New field for order status

    // Default constructor
    public Order() {
        this.status = OrderStatus.PROCESSING; // Default status
    }

    // Constructor with parameters
    public Order(Payment payment, Client client, Date orderDate, double totalPrice, CartItem myCart, OrderStatus status) {
        this.payment = payment;
        this.client = client;
        this.orderDate = orderDate;
        this.totalPrice = totalPrice;
        this.myCart = myCart;
        this.status = status;
    }

    // Getters and Setters
    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Payment getPayment() {
        return payment;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Date getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Date orderDate) {
        this.orderDate = orderDate;
    }

    public double getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public CartItem getMyCart() {
        return myCart;
    }

    public void setMyCart(CartItem myCart) {
        this.myCart = myCart;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
