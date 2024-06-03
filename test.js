const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const csvFilePath = path.join(__dirname, 'data.csv');
const parser = fs.createReadStream(csvFilePath).pipe(parse({ trim: true }));

let totalSales = 0;
const salesByMonth = new Map();

parser.on('data', (row) => {
    if (row[0] === 'Date') return;

    const date = row[0].trim();
    const sku = row[1].trim();
    const quantity = parseInt(row[3].trim(), 10);
    const totalPrice = parseFloat(row[4].trim());
    const month = date.substring(0, 7); 

    totalSales += totalPrice;

    if (!salesByMonth.has(month)) {
        salesByMonth.set(month, { totalSales: 0, items: new Map() });
    }

    const monthData = salesByMonth.get(month);
    monthData.totalSales += totalPrice;

    if (!monthData.items.has(sku)) {
        monthData.items.set(sku, { quantity: 0, totalPrice: 0, orders: [] });
    }

    const itemData = monthData.items.get(sku);
    itemData.quantity += quantity;
    itemData.totalPrice += totalPrice;
    itemData.orders.push(quantity);
});

parser.on('end', () => {
    console.log('Total Sales:', totalSales);

    for (const [month, data] of salesByMonth.entries()) {
        console.log(`Month: ${month}, Total Sales: ${data.totalSales}`);

        let mostPopularItem = null;
        let maxQuantity = 0;
        let maxRevenueItem = null;
        let maxRevenue = 0;

        for (const [sku, itemData] of data.items.entries()) {
            if (itemData.quantity > maxQuantity) {
                mostPopularItem = sku;
                maxQuantity = itemData.quantity;
            }
            if (itemData.totalPrice > maxRevenue) {
                maxRevenueItem = sku;
                maxRevenue = itemData.totalPrice;
            }
        }

        console.log(`Most Popular Item: ${mostPopularItem}, Quantity Sold: ${maxQuantity}`);
        console.log(`Item Generating Most Revenue: ${maxRevenueItem}, Revenue: ${maxRevenue}`);

        if (mostPopularItem) {
            const popularItemData = data.items.get(mostPopularItem);
            const minOrders = Math.min(...popularItemData.orders);
            const maxOrders = Math.max(...popularItemData.orders);
            const avgOrders = popularItemData.orders.reduce((sum, val) => sum + val, 0) / popularItemData.orders.length;

            console.log(`Most Popular Item Order Stats: Min: ${minOrders}, Max: ${maxOrders}, Avg: ${avgOrders.toFixed(2)}`);
        }
    }
});

parser.on('error', (err) => {
    console.error('Error:', err.message);
});



















// const fs = require('fs');
// const path = require('path');
// const { parse } = require('csv-parse'); // Correctly import the parse function

// const csvFilePath = path.join(__dirname, 'data.csv');
// const parser = fs.createReadStream(csvFilePath).pipe(parse({ trim: true }));

// let totalSales = 0;

// parser.on('data', (row) => {
//     // Skip the header row
//     if (row[0] === 'Date') return;

   
//     const totalPrice = parseFloat(row[4].trim());

//     // Add to total sales
//     totalSales += totalPrice;

   
// });

// parser.on('end', () => {
//     console.log('Total Sales:', totalSales);
   
// });

// parser.on('error', (err) => {
//     console.error('Error reading the CSV file:', err.message);
// });
