use crm;
-- Inserting data into Companies
INSERT INTO ShippingCompany(companyName , zhiFuVerification, wxId, phoneNumber) VALUES
('FEDEX', '菜', 'BigDawg0123', '+86 10834567846'),
('FEDEX', '高', 'Speed9012', '+86 10834567692');

INSERT INTO Customers (userName, phoneNumber, email) VALUES
('Yuehua', '+60 6789 2345', 'yuehua@asd.com'),
('YeHua', '+60 6789 2456', 'yehua@asd.com');

INSERT INTO Suppliers (studioName, zhiFuVerification, wxId, phoneNumber) VALUES
('GkOfficial', '购', 'Imtherealg@asd.com', '+86 1067892345'),
('BigDawg', '罪', 'Imtherealgoat@asd.com', '+86 1067892709');

-- Insert data into Products table
INSERT INTO Products (productName, description) VALUES
('Product A', 'Description for Product A'),
('Product B', 'Description for Product B');

-- Insert data into ProductVersion table
INSERT INTO ProductVersion (product_id, image_url, versionName, price) VALUES
(1, 'Naruto.jpg', 'Version 1', 550),
(1, 'Narutover2.jpg', 'Version 2', 650),
(2, 'Sasuke.jpg', 'Version 1', 500);
