# Point of Sale App

A web-based point of sale system built with a React frontend and an ASP.NET Core Web API backend, backed by a SQL Server database. It lets you manage products, salespersons, and sales transactions through a clean browser interface.

---

## Tech Stack

**Frontend**
- React 19
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- React Toastify

**Backend**
- ASP.NET Core Web API (.NET)
- Microsoft.Data.SqlClient
- Swagger / Swashbuckle

**Database**
- Microsoft SQL Server
- Stored procedures for all database operations

---

## Project Structure

```
PointOfSaleApp/
  Frontend/          React frontend (Vite)
  POSWebApi/         ASP.NET Core Web API
  db-scripts/        SQL scripts to set up the database
```

---

## Prerequisites

Before running anything, make sure you have the following installed:

- Node.js (v18 or higher)
- .NET SDK (v8 or higher)
- SQL Server (any edition, including SQL Server Express)
- SQL Server Management Studio or any SQL client to run the scripts

---

## Database Setup

All the SQL scripts are in the `db-scripts` folder. You need to run them in this order:

**1. Create the tables**

Run `Tables.sql` first. This creates the four core tables: `Product`, `Salesperson`, `SalesMaster`, and `SalesDetail`.

**2. Create the stored procedures**

Run these four files in any order after the tables are created:

- `Product_sps.sql` - stored procedures for product CRUD
- `Salesperson_sps.sql` - stored procedures for salesperson CRUD
- `SalesMaster_sps.sql` - stored procedures for sales header CRUD
- `SalesDetail_sps.sql` - stored procedures for sales line items CRUD

You can run them in SQL Server Management Studio by opening each file and hitting Execute, or by running them through the `sqlcmd` command line tool.

---

## Backend Setup

**1. Update the connection string**

Open `POSWebApi/appsettings.json` and update the `DefaultConnection` value to point to your SQL Server instance and database:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=pos;Trusted_Connection=True;MultipleActiveResultSets=True;TrustServerCertificate=True"
}
```

Replace `YOUR_SERVER_NAME` with your actual SQL Server instance name. If you are using SQL Server Express, it is usually `.\SQLEXPRESS` or `localhost\SQLEXPRESS`.

**2. Run the API**

Open a terminal in the `POSWebApi` folder and run:

```cmd
dotnet run
```

The API will start on `http://localhost:5101`. You can also access the Swagger UI at `http://localhost:5101/swagger` to browse and test all the endpoints.

---

## Frontend Setup

**1. Install dependencies**

Open a terminal in the `Frontend` folder and run:

```cmd
npm install
```

**2. Configure the API URL**

The frontend looks for a `VITE_API_BASE_URL` environment variable. If it is not set, it defaults to `http://localhost:5000/api`.

Since the backend runs on port `5101`, create a `.env` file inside the `Frontend` folder with this content:

```
VITE_API_BASE_URL=http://localhost:5101/api
```

**3. Start the frontend**

```cmd
npm run dev
```

The app will be available at `http://localhost:5173` in your browser.

---

## Running the Full App

To run everything together you need two terminals open at the same time:

Terminal 1 - start the backend:
```cmd
cd POSWebApi
dotnet run
```

Terminal 2 - start the frontend:
```cmd
cd Frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## What You Can Do

- Add, edit, and delete products with cost price and retail price
- Add, edit, and delete salespersons
- Create new sales transactions by selecting a salesperson and adding products
- Edit existing sales and update quantities, discounts, and line items
- View all past sales records
- Delete sales

---

## API Overview

The backend exposes the following route groups under `/api`:

- `/api/product` - product management
- `/api/salesperson` - salesperson management
- `/api/salesmaster` - sales header management
- `/api/salesmaster/salesdetails` - sales line item management

Full documentation is available through Swagger at `http://localhost:5101/swagger` when the backend is running.
