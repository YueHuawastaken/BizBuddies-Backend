CREATE DATABASE crm;

USE crm;

-- Creating Companies Table
CREATE TABLE ShippingCompany (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    companyName VARCHAR(255) NOT NULL,
    zhiFuVerification VARCHAR (255) NOT NULL, 
    wxId VARCHAR (255) NOT NULL, 
    phoneNumber VARCHAR (255) NOT NULL 
);

-- Creating Customers Table
CREATE TABLE Customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR (255) NOT NULL,
    email VARCHAR (255) NOT NULL
);

-- Creating Employees Table
CREATE TABLE Suppliers (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    studioName VARCHAR(255) NOT NULL,
    zhiFuVerification VARCHAR (255) NOT NULL, 
    wxId VARCHAR (255) NOT NULL, 
    phoneNumber VARCHAR (255) NOT NULL
);

-- Creating Products Table
CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    productName VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE ProductVersion (
    productVersion_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT, 
    image_url VARCHAR(255),
    versionName VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

