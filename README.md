# 💼 Legal Affairs Platform

A modern web app for **instant, AI-powered legal document analysis**, real-time lawyer-client interaction, and geo-based lawyer discovery. Designed with a clean, responsive UI and scalable full-stack architecture.

---

## 🚀 Features

1. **Automated PDF Upload & Analysis**  
   - Upload legal documents (contracts, agreements)  
   - Instant AI-powered risk summary and clause highlighting

2. **Clause Highlighting & Risk Dashboard**  
   - Automatically flag risky clauses  
   - Visual summary: risk levels, document stats, flagged terms

3. **Secure In-App Chat**  
   - Encrypted messaging between clients and lawyers  
   - Share documents and track conversation context

4. **Nearby Lawyer Finder**  
   - Geo-based search with filters (specialization, ratings, language)  
   - One-click contact via chat or call

5. **Lawyer Onboarding & Promotion**  
   - Verified profile creation (ID/bar verification)  
   - Option to advertise services with featured listings

6. **Client Dashboard**  
   - Real-time tracking of cases, chats, docs, and status updates

7. **Smart Document Handling**  
   - Upload, store, and analyze files digitally  
   - Eliminates printing/scanning

8. **Verified Lawyer Network**  
   - Onboarded professionals only with verified credentials

---

## 👍 Product USP

- 🧠 AI-powered instant legal insight  
- 💬 Secure, traceable in-app communication  
- 📍 Geo-based, verified lawyer discovery  
- 🧑‍⚖️ Lawyer self-promotion & verified profiles  
- 📊 Unified client dashboard  
- ⚙️ Scalable, cloud-native architecture  
- 🌍 Responsive, user-friendly interface  
- 🔄 End-to-end legal tech ecosystem

---

## 👥 User Flow

### Client
1. Sign up / log in  
2. Upload PDF → get AI analysis  
3. Find and select a lawyer (filter by nearby, specialist, rating)  
4. Start secure chat & share docs  
5. Access real-time updates via dashboard  

### Lawyer
1. Sign up & complete ID/bar verification  
2. Create and optionally promote profile  
3. Receive and respond to client chats  
4. Analyze documents and share insights  
5. Build reputation via reviews and lead generation  

---

## 🎨 Design Highlights

- **Clean UI** for confidence and ease of use  
- **Separate dashboards** for clients and lawyers  
- **Core flows** are 1–2 clicks away  
- **Mobile-responsive** for all devices  
- **Consistent styling** via Tailwind CSS  

---

## 🏗️ Technical Architecture

- **Frontend**  
  - React.js with Axios and React Router  
  - Dynamic routing and secure state management  

- **Backend**  
  - Node.js + Express: handles APIs, file handling, chat logic  

- **Database**  
  - MongoDB via Mongoose: users, cases, docs, chats  

- **Authentication**  
  - JWT-based secure sessions  

- **AI Module**  
  - OpenAI/GPT API for PDF analysis and summarization  

- **File Storage**  
  - Cloudinary for images and file uploads  

- **Live Chat**  
  - Socket.io for real-time messaging  

- **Map Integration**  
  - Google Maps or Mapbox for lawyer location services  

- **Hosting**  
  - Frontend: Netlify/Vercel  
  - Backend: Render/Railway  
  - Database: MongoDB Atlas  

---

## 🛠️ Tech Stack Overview

| Layer            | Technology                                            |
|------------------|-------------------------------------------------------|
| **Frontend**     | React.js, Tailwind CSS, Axios, react-router-dom       |
| **Backend**      | Node.js, Express.js, Socket.io                        |
| **Database**     | MongoDB + Mongoose                                   |
| **Auth**         | JWT                                                  |
| **AI/NLP**       | OpenAI API (GPT for PDF clause analysis)             |
| **PDF Parsing**  | `pdf-parse` (Node.js)                                 |
| **File Upload**  | Cloudinary                                           |
| **Maps**         | Google Maps / Mapbox API                             |
| **Deployment**   | Netlify/Vercel (frontend), Render/Railway (backend), MongoDB Atlas |

---

## 📦 Development Setup

### 1. Clone repo  
```bash
git clone https://github.com/thedgarg31/legal-affairs-platform-app.git
cd legal-affairs-platform-app
````

### 2. Backend setup

```bash
cd backend
npm install express mongoose cors dotenv socket.io pdf-parse
npm install --save-dev nodemon
```

### 3. Frontend setup

```bash
cd ../frontend
npm install axios react-router-dom socket.io-client tailwindcss
npm install react-whatsapp # optional chat UI enhancement
```

### 4. Run servers

```bash
# Backend
cd backend
npm run dev

# Frontend
cd ../frontend
npm start
```

### 5. Env variables

**Frontend (.env):**

```
REACT_APP_API_URL=http://localhost:5000/api
```

**Backend (.env):**

```
PORT=5000
MONGO_URI=<your_mongo_connection_string>
JWT_SECRET=<your_jwt_secret>
CLOUDINARY_URL=<cloudinary_config>
OPENAI_API_KEY=<openai_api_key>
MAP_API_KEY=<google_or_mapbox_key>
```

---

## 💡 How to Use

1. Register or log in
2. **Clients:**

   * Upload PDF → view analysis
   * Search for nearby lawyers → start chat
   * Track cases and updates through the dashboard
3. **Lawyers:**

   * Sign up and verify credentials
   * Manage chats and document reviews
   * Advertise with optional featured profile

---

## 🧑‍💻 Contributing

* PRs welcome! For major changes, please open an issue first to discuss.
* Ensure code quality, consistent UI, and testing before submitting.

---

## 📞 Contact

For questions or demo requests, reach out to:

* [dgav3105@gmail.com](mailto:dgav3105@gmail.com)
* [ahmedsiddiquefarhan@gmail.com](mailto:ahmedsiddiquefarhan@gmail.com)
* [jaivardhansingh785@gmail.com](mailto:jaivardhansingh785@gmail.com)
* [aryanbalhara3700@gmail.com](mailto:aryanbalhara3700@gmail.com)

---

**Transform legal document analysis with AI—fast, secure, and accessible.**

```
