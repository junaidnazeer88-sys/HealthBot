# HealthBot — AI Medical Chatbot
MCA Project · University of Kashmir
## 🗂️ System Architecture & Structure

This project is built using a modern microservices approach, separated into three distinct environments:

```text
HealthBot/
├── client/    # Frontend: React.js UI (User Dashboard, Auth Forms, Chat UI)
├── server/    # Backend: Node.js & Express API (JWT Auth, MongoDB Database)
└── ml/        # Machine Learning: Python (Random Forest Disease Prediction)
