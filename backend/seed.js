const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const StockMovement = require("./models/StockMovement");
const ActivityLog = require("./models/ActivityLog");

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/inventory");
        console.log("Connected to MongoDB for seeding...");

        // Wipe existing data (except users)
        await Category.deleteMany({});
        await Product.deleteMany({});
        await StockMovement.deleteMany({});
        await ActivityLog.deleteMany({});
        console.log("Wiped old products, categories, and logs.");

        const user = await User.findOne();
        if (!user) {
            console.error("No user found. Please register a user first.");
            process.exit(1);
        }

        // Create 5 Categories
        const catData = [
            { name: "Electronics", description: "Devices and gadgets" },
            { name: "Peripherals", description: "Keyboards, mice, and accessories" },
            { name: "Cables & Adapters", description: "Connecting wires and dongles" },
            { name: "Storage", description: "Hard drives and flash drives" },
            { name: "Office Supplies", description: "Pens, paper, notebooks" }
        ];
        
        const categories = await Category.insertMany(catData);
        
        await ActivityLog.insertMany(categories.map(cat => ({
            user: user._id,
            action: "Category Created",
            entity: "Category",
            entityId: cat._id,
            details: `Created category: ${cat.name}`,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        })));
        console.log("Created 5 categories.");

        // Define 20 Products
        const prodData = [
            // Out of stock
            { name: "Wireless Mouse", sku: "PER-001", price: 499, stockQuantity: 0, reorderLevel: 10, catIndex: 1 },
            { name: "USB-C Hub", sku: "CAB-001", price: 1299, stockQuantity: 0, reorderLevel: 5, catIndex: 2 },
            { name: "Desk Mat", sku: "OFF-001", price: 899, stockQuantity: 0, reorderLevel: 20, catIndex: 4 },
            
            // Low stock
            { name: "Mechanical Keyboard", sku: "PER-002", price: 3499, stockQuantity: 3, reorderLevel: 10, catIndex: 1 },
            { name: "HDMI Cable (2m)", sku: "CAB-002", price: 299, stockQuantity: 1, reorderLevel: 15, catIndex: 2 },
            { name: "1TB External HDD", sku: "STO-001", price: 4599, stockQuantity: 2, reorderLevel: 5, catIndex: 3 },
            { name: "Notebook", sku: "OFF-002", price: 99, stockQuantity: 4, reorderLevel: 10, catIndex: 4 },
            { name: "Bluetooth Speaker", sku: "ELE-001", price: 1999, stockQuantity: 2, reorderLevel: 5, catIndex: 0 },

            // In stock
            { name: "24-inch Monitor", sku: "ELE-002", price: 12500, stockQuantity: 12, reorderLevel: 5, catIndex: 0 },
            { name: "Gaming Headset", sku: "PER-003", price: 2199, stockQuantity: 15, reorderLevel: 10, catIndex: 1 },
            { name: "Ethernet Cable (5m)", sku: "CAB-003", price: 399, stockQuantity: 40, reorderLevel: 20, catIndex: 2 },
            { name: "256GB SSD", sku: "STO-002", price: 2899, stockQuantity: 25, reorderLevel: 10, catIndex: 3 },
            { name: "Ballpoint Pens (10 Pack)", sku: "OFF-003", price: 150, stockQuantity: 150, reorderLevel: 50, catIndex: 4 },
            { name: "Webcam 1080p", sku: "ELE-003", price: 3499, stockQuantity: 18, reorderLevel: 5, catIndex: 0 },
            { name: "Mousepad", sku: "PER-004", price: 199, stockQuantity: 60, reorderLevel: 20, catIndex: 1 },
            { name: "DisplayPort Cable", sku: "CAB-004", price: 499, stockQuantity: 22, reorderLevel: 10, catIndex: 2 },
            { name: "64GB Flash Drive", sku: "STO-003", price: 699, stockQuantity: 35, reorderLevel: 15, catIndex: 3 },
            { name: "Printer Paper (500 sheets)", sku: "OFF-004", price: 350, stockQuantity: 40, reorderLevel: 20, catIndex: 4 },
            { name: "Wireless Router", sku: "ELE-004", price: 2799, stockQuantity: 14, reorderLevel: 5, catIndex: 0 },
            { name: "Ergonomic Chair", sku: "OFF-005", price: 7999, stockQuantity: 8, reorderLevel: 5, catIndex: 4 }
        ];

        const productsToInsert = prodData.map(p => ({
            name: p.name,
            sku: p.sku,
            price: p.price,
            stockQuantity: p.stockQuantity,
            reorderLevel: p.reorderLevel,
            category: categories[p.catIndex]._id
        }));

        const products = await Product.insertMany(productsToInsert);
        console.log(`Created ${products.length} products.`);

        await ActivityLog.insertMany(products.map(prod => ({
            user: user._id,
            action: "Product Created",
            entity: "Product",
            entityId: prod._id,
            details: `Added new product: ${prod.name} (${prod.sku})`,
            createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000)
        })));

        // Generate 30 days of history
        const movements = [];
        const activityLogs = [];
        
        // We will simulate about 60 random movements spread over the last 30 days
        const reasons = ["Sale", "Restock", "Damaged", "Returned", "Manual Adjustment"];
        
        for (let i = 0; i < 80; i++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const daysAgo = Math.floor(Math.random() * 28);
            const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - Math.random() * 12 * 60 * 60 * 1000);
            
            let quantityChanged = 0;
            let reason = reasons[Math.floor(Math.random() * reasons.length)];
            
            if (reason === "Restock" || reason === "Returned") {
                quantityChanged = Math.floor(Math.random() * 20) + 1;
            } else {
                quantityChanged = -(Math.floor(Math.random() * 5) + 1);
            }

            movements.push({
                product: product._id,
                previousQuantity: Math.max(0, product.stockQuantity - quantityChanged),
                newQuantity: product.stockQuantity, // Note: not entirely chronologically accurate for intermediate states, but fine for demo aggregation
                quantityChanged,
                reason,
                performedBy: user._id,
                createdAt
            });
            
            activityLogs.push({
                user: user._id,
                action: "Stock Updated",
                entity: "Stock",
                entityId: product._id,
                details: `Updated stock for ${product.name} by ${quantityChanged > 0 ? '+'+quantityChanged : quantityChanged} (${reason})`,
                createdAt
            });
        }

        // Sort by date so they appear somewhat logical
        movements.sort((a, b) => a.createdAt - b.createdAt);
        activityLogs.sort((a, b) => a.createdAt - b.createdAt);

        // For the sake of timeline logic, we'll just insert them
        await StockMovement.insertMany(movements);
        await ActivityLog.insertMany(activityLogs);
        
        console.log(`Generated ${movements.length} stock movements and logs.`);
        console.log("Database seed complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDatabase();
