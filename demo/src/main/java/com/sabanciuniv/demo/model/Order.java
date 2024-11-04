package com.sabanciuniv.demo.model;

import java.util.Date;

public class Order {
    private long order_id;
    private CartItem mycart;
    private double total_price;
    private Boolean deliver_status;
    private Date date;

    public Order() {}

    public Order(long order_id, CartItem mycart) {
        this.order_id = order_id;
        this.mycart = mycart;
        this.deliver_status = false;
        this.total_price = this.mycart.getTot_price();
        this.date = new Date();
    }

    public CartItem getMycart() {
        return mycart;
    }
    public double getTotal_price() {
        return total_price;
    }

    public Boolean getDeliver_status() {
        return deliver_status;
    }

    public long getOrder_id() {
        return order_id;
    }

    public Date getDate() {
        return date;
    }
    public void delivered(){deliver_status = true;}
}
