# 🩺 MedChain — AI-Driven, Blockchain-Secured Healthcare Platform

MedChain is a decentralized, intelligent healthcare system that securely manages Electronic Medical Records (EMRs) using Blockchain and AI technologies. It empowers patients with full control over their medical data while providing AI-powered health insights and seamless interoperability between healthcare providers.

## 🚀 Features

- 🔒 Secure Medical Record Storage: Immutable, tamper-proof records stored using Ethereum blockchain (Sepolia Testnet).
- 🧠 AI-Powered Insights: Symptom-based disease prediction (~88% accuracy) and document-based health queries using SBERT, BioBERT, and CNN models.
- 🛡️ Advanced Security: Multi-Factor Authentication (MFA), OAuth2, Role-Based Access Control (RBAC), and JWT-based token authentication.
- 📂 Medical Record Uploads: Upload PDFs (scanned/text) and securely store extracted medical information.
- 🔗 Blockchain Verification: Real-time record integrity checks against on-chain hashes.
- 🖥️ Responsive Frontend: Modern UI developed with React.js and Tailwind CSS.
- 📈 Microservices Architecture: Fast, scalable, and modular system powered by FastAPI backend.

## 🛠️ Tech Stack

| Component | Technology |
| :-------- | :--------- |
| Backend   | FastAPI (Python), SQLAlchemy ORM |
| Database  | PostgreSQL |
| Frontend  | React.js, Tailwind CSS |
| Blockchain | Ethereum Sepolia Testnet (via Alchemy API) |
| AI Models | SBERT, BioBERT, CNN (Symptom-Disease Prediction) |
| Security  | JWT, OAuth2, RBAC, bcrypt hashing |

## 📊 System Architecture

- Modular Microservices (Authentication, AI Services, Blockchain Layer, CRUD Operations)
- Asynchronous processing for fast record handling and AI queries
- Blockchain-based hash storage to ensure 100% record integrity
- RESTful APIs for frontend-backend communication

## ⚙️ Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/medchain.git
   cd medchain
2. **Backend**
   ```bash
   cd backend
   python -m venv env
   source env/bin/activate  # Linux/Mac
   env\Scripts\activate     # Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev

5. **Environment Variables**
DATABASE_URL=postgresql://username:password@localhost/medchain
ALCHEMY_API_KEY=your-alchemy-key
BLOCKCHAIN_ACCOUNT_ADDRESS=your-wallet-address
BLOCKCHAIN_PRIVATE_KEY=your-private-key
AUTH0_DOMAIN=your-auth0-domain
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret


## 📈 Performance Highlights
- <200ms API response time under load
- AI-based disease predictions with ~88% accuracy
- Scalable up to 10,000+ concurrent API requests with FastAPI and PostgreSQL optimization

## 🧠 Future Enhancements
- Smart contract-based fine-grained access control
- Integration with wearables and real-time health monitoring
- IPFS decentralized document storage
- Deployment on mainnet (Ethereum / Polygon) with Layer-2 scaling

## 🤝 Contributors
- Sakshi Lele — Full Stack Developer
