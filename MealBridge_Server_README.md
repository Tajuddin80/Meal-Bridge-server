
# 🌐 MealBridge Server

**MealBridge Server** is the backend of the MealBridge platform. It powers the connection between donors and receivers by handling authentication, authorization, and data operations securely through a RESTful API.

---

## 🎯 Purpose

The MealBridge server handles:

✅ Secure food item management (CRUD)  
✅ Firebase-based authentication + JWT verification  
✅ Role-based access for donors and receivers  
✅ Efficient MongoDB operations  
✅ Robust API responses and error handling  

---

## 🌐 **Live Demo**

👉 [🚀 Visit MealBridge](https://meal-bridge-project.web.app/)  

---
## 🌐 **Client site github repo**

👉 🚀 https://github.com/Programming-Hero-Web-Course4/b11a11-client-side-Tajuddin-green

---
## 🌐 **Server site github repo**

👉 🚀 https://github.com/Programming-Hero-Web-Course4/b11a11-server-side-Tajuddin-green


---

## 🚀 Tech Stack

- **Node.js + Express** — Server framework  
- **MongoDB (Atlas)** — Database  
- **Firebase Admin SDK** — Authentication  
- **dotenv** — Environment variable management  
- **CORS** — Cross-origin resource sharing  

---

## 📦 NPM Packages

| Package          | Purpose                             |
|------------------|-------------------------------------|
| `express`         | Web framework                       |
| `cors`            | Handle cross-origin requests        |
| `dotenv`          | Load environment variables          |
| `firebase-admin`  | Verify Firebase tokens              |
| `mongodb`         | Connect and query MongoDB           |

---

## ⚡ Available Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm start`     | Runs the server with Node.js   |
| `npm run dev`   | Runs with nodemon for dev      |

---



## 🔑 Security

- All sensitive routes are protected by **Firebase token verification**
- Users can **only modify or delete their own food items**
- Tokens must be provided in the `Authorization` header as `Bearer <token>`

---




## 👨‍💻 Author

MealBridge Team

---
