# 📚 BookKart – Full-Stack Bookstore Platform

BookKart is a full-stack bookstore application built using **Node.js (TypeScript) for the backend** and **Next.js for the frontend**. It features authentication, payment processing, cloud storage, and a seamless user experience.

## 🚀 Tech Stack
- **Backend:** Node.js (TypeScript), Express.js, MongoDB (Mongoose)
- **Frontend:** Next.js (React)
- **Database:** MongoDB (MongoDB Atlas)
- **Authentication:** Google OAuth
- **Storage:** Cloudinary
- **Payments:** Razorpay
- **Deployment:** Render (Backend), Vercel (Frontend)

---

## 🛠 Setup & Installation

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/your-repo/book-kart.git
cd book-kart
cd backend
npm install

### ** Environment Variables (backend/.env)**
Create a .env file in the backend/ directory with the following variables:

MONGODB_URI=your-mongodb-uri
EMAIL_USER=your-email
EMAIL_PASS=your-email-password
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/auth/google/callback

# Cloudinary
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

## Run Backend Locally
`npm run dev
`
3️⃣ Frontend Setup (Next.js)

cd frontend
npm install

Create a .env.local file in the frontend/ directory:

NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id

## Run Frontend Locally
`npm run dev
`

## 🚀 Deployment

### Backend Deployment on Render
1. Create a new service on **Render**.
2. Select the **GitHub repository** and choose the **backend** folder.
3. Set up **environment variables** under **Environment Settings**.
4. Deploy and get the **backend URL**.

### Frontend Deployment on Vercel
1. Create a new project on **Vercel**.
2. Select the **GitHub repository** and choose the **frontend** folder.
3. Set up **environment variables** under **Settings > Environment Variables**.
4. Deploy and get the **frontend URL**.

🛠 Contributing
If you want to contribute:

Fork the repository.
Create a feature branch (git checkout -b feature-name).
Commit changes (git commit -m "Added feature").
Push to your branch (git push origin feature-name).
Open a Pull Request.



---

### **Why This README Is Useful?**
✔ **All-in-One File** - Single file with everything included.  
✔ **Clear Project Structure** - Explains folders and file organization.  
✔ **Step-by-Step Setup** - Makes it easy for others to start using the project.  
✔ **Environment Variables** - Shows required `.env` variables (without exposing secrets).  
✔ **Deployment Instructions** - Guides on deploying the project to **Render (backend)** and **Vercel (frontend)**.  
✔ **API Documentation** - Highlights key API routes.  

This **README.md** is ready for sharing with your buyer! 🚀 Let me know if you need any modifications.


📞 Contact
For any queries, reach out via email: desistack7@gmail.com




