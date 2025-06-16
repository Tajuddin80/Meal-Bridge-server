
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

## 📁 Endpoints

Here are some key API routes:

| Method | Endpoint                   | Description                                   | Auth |
|--------|----------------------------|-----------------------------------------------|------|
| `POST` | `/adduser`                  | Add a new user                                | ❌    |
| `GET`  | `/users`                    | Fetch all users                               | ❌    |
| `POST` | `/addfood`                  | Add food item (donor only)                    | ✅    |
| `GET`  | `/featuredfood`             | Get top featured foods                        | ❌    |
| `GET`  | `/allfoods`                 | Get all available foods                       | ❌    |
| `GET`  | `/myfoods`                  | Get foods added by logged-in donor            | ✅    |
| `PUT`  | `/updateFood/:id`           | Update specific food (only owner can update)  | ✅    |
| `DELETE` | `/allfoods/:id`           | Delete food (only owner can delete)           | ✅    |
| `POST` | `/requestedFood`            | Request a food                                | ✅ (optional) |
| `GET`  | `/requestedFood`            | Get requested foods by logged-in user         | ✅    |

---

## 🔑 Security

- All sensitive routes are protected by **Firebase token verification**
- Users can **only modify or delete their own food items**
- Tokens must be provided in the `Authorization` header as `Bearer <token>`

---

## 🛠️ Environment Variables

Create a `.env` file:

\`\`\`env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
\`\`\`

---

## 🏁 How to Run

\`\`\`bash
npm install
npm run dev
\`\`\`

The server runs on `http://localhost:3000` by default.

---

## 📌 Notes

- Ensure you have a `meal-bridge-project-firebase-key.json` file for Firebase Admin SDK.
- The server uses **strict MongoDB queries** and modern API standards.

---

## 👨‍💻 Author

MealBridge Team

---
