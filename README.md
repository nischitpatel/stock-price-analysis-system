# 📈 Stock Price Analysis System

A full-stack web application to view trending stock symbols, fetch real-time market data, and display company information.
The project uses a **Node.js backend** to handle API requests and a **React frontend** to display the data.

---

## 🛠 Tech Stack

### **Frontend**

* React
* Fetch API / Axios
* Deployed on **Vercel**

### **Backend**

* Node.js
* Express.js
* Yahoo Finance API (yahoo-finance2)
* Deployed on **Render**

---

## 🌐 Live Demo

### **URL**

🔗 [https://stock-price-analysis-system.vercel.app/](https://stock-price-analysis-system.vercel.app/)

---

## 📌 Features

* View trending stock symbols
* Get live stock prices for any ticker
* Company metadata lookup using `company_tickers.json`
* Backend caching to avoid Yahoo 429 rate-limit errors
* Clean UI with fast response times

---

## 🚀 How It Works

The React app sends requests to the backend hosted on Render:

```
React (Vercel) → Node.js API (Render) → Yahoo Finance API
```

The backend caches responses to reduce API throttling.

---

## ▶️ Run Locally

### Frontend

```
cd frontend
npm install
npm run dev
```

### Backend

```
cd backend
npm install
npm start
```