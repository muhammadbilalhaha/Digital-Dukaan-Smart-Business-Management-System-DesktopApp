# Digital Dukaan

**Digital Dukaan** is a modern offline-first desktop business management system designed to simplify and organize everyday business operations in one place.

## 📌 Overview

Digital Dukaan is an offline-first desktop business management system built to help businesses manage their day-to-day operations from a single application.
The system brings essential business activities together, including product and inventory management, sales, purchases, customers, suppliers, payments, expenses, returns, and business reporting.
The application is designed with an **offline-first approach**, allowing core business operations and data to be managed locally without requiring a constant internet connection. This makes it suitable for environments where reliable internet access is not always available.
Digital Dukaan focuses on keeping business management simple, organized, and practical by connecting different parts of the business workflow instead of managing them as completely separate systems.

### 🎯 Goals
The main goals of Digital Dukaan are to:
- Simplify everyday business management.
- Keep important business information organized in one system.
- Track inventory and stock movements accurately.
- Record sales and purchases systematically.
- Manage customers and suppliers.
- Track payments, outstanding balances, and expenses.
- Handle product and transaction returns.
- Provide useful business reports and financial summaries.
- Reduce dependence on manual bookkeeping.
- Keep business data available locally through an offline-first architecture.

### 🔄 Core Business Workflow
Digital Dukaan connects the major business operations into a single workflow:
**Products → Purchases → Inventory → Sales → Payments → Customers/Suppliers → Expenses & Returns → Reports**
Changes made through transactions can affect related business information automatically. For example, purchasing products increases inventory, while selling products decreases available stock.

### 💡 Design Philosophy
Digital Dukaan is designed around three main principles:
- **Simple** — Business operations should be easy to understand and use.
- **Connected** — Different business activities should work together rather than exist as isolated records.
- **Offline-first** — Core functionality and business data should remain accessible without depending on a continuous internet connection.

- ## ✨ Features
Digital Dukaan provides a complete set of tools for managing everyday business operations from a single application.
### 🏢 Business Management
* Manage business information and settings.
* Configure owner and business details.
* Manage application users and access.
* Keep essential business data organized in one place.

### 📦 Product & Inventory Management
* Add, edit, and manage products.
* Organize products using categories.
* Track product prices and stock quantities.
* Set low-stock limits.
* Track stock movements through purchases, sales, and returns.
* Monitor inventory value and stock levels.
* Identify low-stock and out-of-stock products.
* **Protect actual product cost prices from regular users.**
* **Allow only the owner to view actual product cost/purchase prices after verification.**

### 🛒 Sales Management
* Create and manage sales transactions.
* Search and select products quickly.
* Add multiple products to a sale.
* Manage quantities and discounts.
* Record customer information when applicable.
* Support walk-in customers.
* Record payments received from sales.
* Automatically update inventory after a sale.
* Generate sales receipts.

### 🧾 Purchase Management
* Record purchases from suppliers.
* Select existing suppliers or create new suppliers.
* Add multiple products to a purchase.
* Record purchase quantities and prices.
* Track additional purchase charges such as transportation and loading.
* Record purchase payments.
* Automatically increase inventory when purchases are recorded.

### 👥 Customer Management
* Maintain records of registered customers.
* Store customer information.
* View customer transaction history.
* Track customer payments and outstanding balances.
* View related sales and payment details.

### 🚚 Supplier Management
* Maintain supplier records.
* Store supplier information.
* Track purchases from suppliers.
* View supplier transaction history.
* Track supplier payments and outstanding balances.

### 💳 Payment Management
* Record business-related payments.
* Track customer payments.
* Track supplier payments.
* Monitor paid and outstanding amounts.
* Maintain a clear payment history.

### 💰 Expense Management
* Record business expenses.
* Organize expenses by category.
* Track expense amounts and dates.
* Monitor business spending over time.

### 🔄 Returns Management
* Handle customer returns.
* Handle supplier returns.
* Support partial returns.
* Automatically adjust related stock quantities.
* Record refund or exchange information.
* Generate return receipts.

### 📊 Reports
* Generate a complete business report.
* View sales and purchase summaries.
* Review payments and outstanding balances.
* Analyze inventory and product information.
* Review customers and suppliers.
* Track expenses and returns.
* View an overall business summary.
* Export business information as a report.

### 🔐 Security & Data Protection
* Local-first data storage.
* User authentication with PIN-based access.
* **Restrict sensitive product cost information to the owner.**
* **Require owner verification before displaying actual product cost/purchase prices.**
* Keep business data stored locally.
* Backup and restore support for application data.

### 💾 Offline-First Architecture
Digital Dukaan is designed to keep core business operations available without requiring a continuous internet connection.
This allows businesses to manage products, inventory, sales, purchases, payments, customers, suppliers, expenses, returns, and reports even in environments with limited or unreliable internet access.


## ⚙️ Installation

Follow the steps below to set up Digital Dukaan for local development.

### 📋 Prerequisites

Before installing Digital Dukaan, make sure the following tools are installed on your system:

* **Node.js** — Required for the frontend and JavaScript dependencies.
* **npm** — Used to install and manage project dependencies.
* **Rust** — Required for the Tauri backend.
* **Tauri prerequisites** — Required dependencies for building and running the desktop application.

### 📥 Clone the Repository

Clone the Digital Dukaan repository:

```bash
git clone https://github.com/muhammadbilalhaha/Digital-Dukaan-Smart-Business-Management-System-DesktopApp.git
```

Navigate to the project directory:

```bash
cd Digital-Dukaan-Smart-Business-Management-System-DesktopApp
```

### 📦 Install Dependencies

Install the required frontend dependencies:

```bash
npm install
```

### ▶️ Run the Application

Start Digital Dukaan in development mode:

```bash
npm run tauri dev
```

The Digital Dukaan desktop application will launch in development mode.

### 🏗️ Build the Application

To create a production build:

```bash
npm run tauri build
```

The generated application packages will be available in the Tauri build output directory.

### 🗄️ Database

Digital Dukaan uses a local SQLite database. Database initialization and required migrations are handled by the application during setup.

> **Note:** Do not commit local database files, backups, generated reports, receipts, or other private business data to the repository.

## 👨‍💻 Author

**Muhammad Bilal**

Computer Science Graduate | Full-Stack Developer | AI • Cybersecurity • Research

Digital Dukaan was developed as a practical software project focused on combining business management, offline-first application design, and secure local data management into a single desktop system.

### ⭐ Support the Project

If you find Digital Dukaan useful or interesting:

* ⭐ Star the repository on GitHub.
* 🐛 Report bugs or issues.
* 💡 Suggest improvements or new features.
* 🤝 Contribute to the project.

Your feedback and support are appreciated.


