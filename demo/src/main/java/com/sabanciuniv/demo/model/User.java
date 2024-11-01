package com.sabanciuniv.demo.model;

public class User {
    private long user_id;
    private long tax_id;
    private String name;
    private String email;
    private String password;
    private String role;

    protected void setRole(String rol){
        rol = role;
    }
    protected String getRole(){
        return role;
    }
    protected void setPassword(String psw){
        password = psw;
    }
    protected String getPassword(){
        return password;
    }
    protected void setEmail(String mail){
        email = mail;
    }
    protected String getEmail(){
        return email;
    }
    protected void setName(String nm){
        name = nm;
    }
    protected String getName(){
        return name;
    }

    public long getTax_id() {
        return tax_id;
    }

    public void setTax_id(long tax_id) {
        this.tax_id = tax_id;
    }

    public long getUser_id() {
        return user_id;
    }

    public void setUser_id(long user_id) {
        this.user_id = user_id;
    }
}
