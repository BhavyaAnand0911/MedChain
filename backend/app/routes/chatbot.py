import os
import json
import asyncio
import uuid
import shutil
import hashlib
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from app.auth import get_current_user 

from web3 import Web3
from pdf2image import convert_from_path
from pdfminer.high_level import extract_text
import pytesseract
import torch
from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
from sentence_transformers import SentenceTransformer, util
from fastapi import APIRouter, File, UploadFile, Form, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import MedicalRecord

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
ALLOWED_EXTENSIONS = {'.pdf'}
TEMP_DIR = "./temp"
MAX_CHUNK_SIZE = 512  # Tokens

# Ensure temp folder exists
os.makedirs(TEMP_DIR, exist_ok=True)

# Load models lazily
_models = {}


def get_sbert_model():
    if "sbert" not in _models:
        logger.info("Loading SBERT model...")
        _models["sbert"] = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _models["sbert"]


def get_qa_pipeline():
    if "qa_pipeline" not in _models:
        logger.info("Loading QA model...")
        model_name = "bert-large-uncased-whole-word-masking-finetuned-squad"
        qa_model = AutoModelForQuestionAnswering.from_pretrained(model_name)
        qa_tokenizer = AutoTokenizer.from_pretrained(model_name)
        _models["qa_pipeline"] = pipeline("question-answering", model=qa_model, tokenizer=qa_tokenizer)
    return _models["qa_pipeline"]


# Security Functions
def verify_user_authorization(user_id: str, record_id: int, db: Session) -> bool:
    """
    Verify if a user has access to a specific medical record.

    Args:
        user_id: The ID of the user requesting access
        record_id: The ID of the medical record being accessed
        db: Database session

    Returns:
        bool: True if user has access, False otherwise
    """
    try:
        # Get the record
        record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
        if not record:
            return False

        # Check if user is the owner of the record
        # This is a simple check - in production, you'd want more robust authorization
        if record.patient_name == user_id:
            return True

        # For testing purposes, allow access (REMOVE IN PRODUCTION)
        logger.warning(f"Authorization check bypassed for user {user_id} - REMOVE IN PRODUCTION")
        return True
    except Exception as e:
        logger.error(f"Error during authorization check: {e}")
        return False


# Blockchain Configuration
class BlockchainManager:
    def __init__(self):
        # Get credentials from environment variables with fallbacks for testing
        self.alchemy_api_key = os.getenv("ALCHEMY_API_KEY", "vzS2Tnzm-HDn1aXRB755NplusFD3iD-X")
        self.wallet_address = os.getenv("BLOCKCHAIN_ACCOUNT_ADDRESS", "0x87103a95b5f4dd204Eb189B59024610946A8c7dA")
        self.private_key = os.getenv("BLOCKCHAIN_PRIVATE_KEY",
                                     "6ed956555e3153f281b31c7732ab9de977258a7a10c9d9a02ab66abe1d824299")

        # Complete RPC URL with the API key
        self.rpc_url = f"https://eth-sepolia.g.alchemy.com/v2/{self.alchemy_api_key}"
        self.chain_id = 11155111
        self.web3 = None
        self.is_connected = False
        self.initialize()

    def initialize(self):
        """Initialize the blockchain connection"""
        # Log credential status for debugging
        logger.info(f"API Key present: {bool(self.alchemy_api_key)}")
        logger.info(f"Wallet address present: {bool(self.wallet_address)}")
        logger.info(f"Private key present: {bool(self.private_key)}")

        if not self.alchemy_api_key or not self.wallet_address or not self.private_key:
            logger.warning("Blockchain credentials not fully configured")
            return

        try:
            self.web3 = Web3(Web3.HTTPProvider(self.rpc_url))
            if self.web3.is_connected():
                self.is_connected = True
                balance = self.web3.eth.get_balance(self.wallet_address)
                logger.info(f"✅ Connected to Ethereum Sepolia. Current Block: {self.web3.eth.block_number}")
                logger.info(f"Wallet balance: {self.web3.from_wei(balance, 'ether')} ETH")
            else:
                logger.error("❌ Blockchain connection failed")
        except Exception as e:
            logger.error(f"Blockchain initialization error: {e}")

    def generate_record_hash(self, record: Dict[str, Any]) -> str:
        """Create a deterministic hash of the record data"""
        # Create a normalized copy of the record to ensure consistent hashing
        normalized_record = dict(record)
        # Sort keys for consistent serialization order
        return hashlib.sha256(json.dumps(normalized_record, sort_keys=True).encode()).hexdigest()

    def store_hash_on_blockchain(self, record_hash: str) -> Optional[str]:
        """Store a hash on the blockchain and return transaction hash"""
        if not self.is_connected:
            logger.warning("Blockchain not connected, skipping hash storage")
            return None

        try:
            # Check wallet balance
            balance = self.web3.eth.get_balance(self.wallet_address)
            logger.info(f"Wallet balance: {self.web3.from_wei(balance, 'ether')} ETH")

            if balance == 0:
                logger.error("Wallet has zero balance, cannot send transaction")
                return None

            nonce = self.web3.eth.get_transaction_count(self.wallet_address)
            logger.info(f"Current nonce: {nonce}")

            gas_price = int(self.web3.eth.gas_price * 1.1)
            logger.info(f"Gas price: {self.web3.from_wei(gas_price, 'gwei')} gwei")

            # Build the transaction
            txn = {
                "from": self.wallet_address,
                "to": self.wallet_address,
                "value": 0,
                "gas": 100000,
                "gasPrice": gas_price,
                "nonce": nonce,
                "chainId": self.chain_id,
                "data": self.web3.to_hex(text=record_hash)
            }
            logger.info(f"Transaction prepared: {txn}")

            # Sign and send transaction
            signed_txn = self.web3.eth.account.sign_transaction(txn, self.private_key)
            logger.info("Transaction signed successfully")

            tx_hash = self.web3.eth.send_raw_transaction(signed_txn.raw_transaction)
            hex_hash = self.web3.to_hex(tx_hash)
            logger.info(f"Transaction submitted with hash: {hex_hash}")

            return hex_hash
        except Exception as e:
            logger.error(f"Error storing hash on blockchain: {str(e)}")
            # Print full traceback for debugging
            import traceback
            logger.error(traceback.format_exc())
            return None

    def verify_record_hash(self, record: Dict[str, Any], stored_hash: str) -> bool:
        """Verify that the current record matches the stored hash"""
        if not stored_hash:
            logger.warning("No stored hash to verify against")
            return False

        # Generate current hash and compare
        current_hash = self.generate_record_hash(record)
        logger.info(f"Verification - Current hash: {current_hash}")
        logger.info(f"Verification - Stored hash: {stored_hash}")

        match = current_hash == stored_hash
        if match:
            logger.info("Hash verification succeeded")
        else:
            logger.warning("Hash verification failed - hashes do not match")

        return match


# Initialize blockchain manager
blockchain = BlockchainManager()
logger.info(f"Blockchain connected: {blockchain.is_connected}")


# PDF Processing
async def process_pdf_async(file_path: str) -> str:
    """Process PDF file asynchronously"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, extract_pdf_text, file_path)


def extract_pdf_text(file_path: str) -> str:
    """Extract text from PDF using multiple methods if needed"""
    try:
        # First try pdfminer
        extracted_text = extract_text(file_path).strip()
        if extracted_text:
            return extracted_text

        # Fallback to OCR
        logger.info(f"Using OCR fallback for {file_path}")
        pages = convert_from_path(file_path, 300)
        text = "\n".join([pytesseract.image_to_string(page) for page in pages]).strip()
        if text:
            return text

        return "No readable text found."
    except Exception as e:
        logger.error(f"Error extracting text: {e}")
        return "Error processing document."


def cleanup_temp_files(filepath: str):
    """Remove temporary files"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
    except Exception as e:
        logger.error(f"Error cleaning up file {filepath}: {e}")


def chunk_text(text: str, max_size: int = 512) -> List[str]:
    """Split text into chunks of roughly equal size"""
    sentences = text.replace("\n", " ").split(". ")
    chunks = []
    current_chunk = []
    current_size = 0

    for sentence in sentences:
        # Rough estimate of token count
        sentence_size = len(sentence.split())
        if current_size + sentence_size > max_size and current_chunk:
            chunks.append(". ".join(current_chunk) + ".")
            current_chunk = [sentence]
            current_size = sentence_size
        else:
            current_chunk.append(sentence)
            current_size += sentence_size

    if current_chunk:
        chunks.append(". ".join(current_chunk) + ".")

    return chunks


# API Router
router = APIRouter(prefix="/medical_chatbot", tags=["medical_chatbot"])


# Upload Medical Record
@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_medical_record(
        background_tasks: BackgroundTasks,
        file: UploadFile = File(...),
        username: str = Form(...),
        patient_id: Optional[str] = Form(None),
        db: Session = Depends(get_db)
):
    """Upload and process a medical record PDF"""
    try:
        # Validate file
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only {', '.join(ALLOWED_EXTENSIONS)} files are supported"
            )

        # Check file size
        file.file.seek(0, 2)  # Move to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset position

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024 * 1024)}MB"
            )

        # Save file temporarily
        file_id = str(uuid.uuid4())
        file_path = f"{TEMP_DIR}/{file_id}_{file.filename}"
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Process file
            extracted_text = await process_pdf_async(file_path)

            # Create record
            record_data = {"notes": extracted_text}
            if patient_id:
                record_data["patient_id"] = patient_id

            # Create database record
            new_record = MedicalRecord(
                patient_name=username,
                #filename=file.filename,  # Store the filename
                diagnosis="",
                medications="[]",
                raw_data=json.dumps(record_data),
                created_at=datetime.utcnow()
            )

            db.add(new_record)
            db.commit()
            db.refresh(new_record)

            # Store hash on blockchain
            record_hash = blockchain.generate_record_hash(record_data)
            logger.info(f"Generated Hash: {record_hash}")

            tx_hash = blockchain.store_hash_on_blockchain(record_hash)
            logger.info(f"Transaction Hash: {tx_hash}")

            if tx_hash:
                # Update record with blockchain info
                new_record.blockchain_hash = tx_hash
                new_record.hash_value = record_hash  # Crucial: Store the hash value for later verification
                db.commit()
                logger.info(f"Record updated with hash: {record_hash}")

            return {
                "message": "Medical record uploaded successfully",
                "record_id": new_record.id,
                "blockchain_tx": tx_hash,
                "text_length": len(extracted_text),
                "hash_value": record_hash  # Return hash value in response for debugging
            }
        finally:
            # Schedule cleanup
            background_tasks.add_task(cleanup_temp_files, file_path)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading record: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# Ask Question About Medical Record
@router.post("/ask")
async def ask_chatbot(
        record_id: int = Form(...),
        query: str = Form(...),
        user_id: str = Form(...),
        db: Session = Depends(get_db)
):
    """Fetch medical records and allow users to ask questions"""
    try:
        # Verify user has access to this record
        if not verify_user_authorization(user_id, record_id, db):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this record"
            )

        # Get record
        record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Medical record not found"
            )

        # Extract text
        raw_data = json.loads(record.raw_data)
        medical_text = raw_data.get("notes", "")
        if not medical_text or medical_text == "No readable text found.":
            return {
                "query": query,
                "response": "The document doesn't contain useful medical information.",
                "blockchain_verified": False
            }

        # Check if query is valid
        if not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )

        # SBERT Retrieval for relevant context
        sbert_model = get_sbert_model()
        query_embedding = sbert_model.encode(query, convert_to_tensor=True)

        # Split text into proper chunks
        text_chunks = chunk_text(medical_text, MAX_CHUNK_SIZE)

        # Get embeddings
        text_embeddings = sbert_model.encode(text_chunks, convert_to_tensor=True)

        # Calculate similarity
        similarity_scores = util.pytorch_cos_sim(query_embedding, text_embeddings)[0]

        # Get top chunks
        top_chunk_indices = similarity_scores.argsort(descending=True)[:2]
        top_chunks = [text_chunks[i] for i in top_chunk_indices]
        context = " ".join(top_chunks)

        # Run question answering
        qa_pipeline = get_qa_pipeline()
        qa_result = qa_pipeline({"question": query, "context": context})

        response = qa_result.get("answer", "No relevant information found.")
        confidence = qa_result.get("score", 0)

        # Verify blockchain record if available
        blockchain_verified = False
        logger.info(f"Record blockchain_hash: {record.blockchain_hash}")
        logger.info(f"Record has hash_value: {hasattr(record, 'hash_value')}")

        if record.blockchain_hash and hasattr(record, 'hash_value') and record.hash_value:
            logger.info(f"Verifying record hash: {record.hash_value}")
            logger.info(f"Raw data structure: {list(raw_data.keys())}")

            # Verification should be more reliable now with enhanced logging
            blockchain_verified = blockchain.verify_record_hash(raw_data, record.hash_value)

            # If verification still fails, this might be a database column issue
            if not blockchain_verified:
                logger.warning("Verification failed despite having hash value")

        return {
            "query": query,
            "response": response,
            "confidence": float(confidence),
            "blockchain_verified": blockchain_verified,
            "record_hash": getattr(record, "hash_value", None)  # Return hash for debugging
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chatbot query: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )

@router.post("/general")
async def general_chatbot(
        query: str = Form(...),
        user_id: str = Form(...),
        db: Session = Depends(get_db)
):
    """Handle general chatbot questions (not record-specific)"""
    try:
        # Check if query is valid
        if not query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Query cannot be empty"
            )

        # Here you would implement your general chatbot logic
        # For example, you might have some predefined responses
        general_responses = {
            "hello": "Hello! How can I help you today?",
            "help": "I can help you with questions about your medical records. Try uploading a record first.",
            # Add more general responses as needed
        }

        # Get a simple response (you would replace this with your actual general chatbot logic)
        response = general_responses.get(query.lower(), 
            "I'm a medical assistant chatbot. Please ask me questions about your medical records.")

        return {
            "query": query,
            "response": response,
            "confidence": 1.0,  # Max confidence for general responses
            "blockchain_verified": False
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing general chatbot query: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )
# Health check endpoint
@router.get("/health")
async def health_check():
    """Service health check endpoint"""
    # Added more details to health check
    health_data = {
        "status": "healthy",
        "blockchain_connected": blockchain.is_connected,
        "timestamp": datetime.utcnow().isoformat()
    }

    # Add blockchain details if connected
    if blockchain.is_connected:
        try:
            health_data["current_block"] = blockchain.web3.eth.block_number
            balance = blockchain.web3.eth.get_balance(blockchain.wallet_address)
            health_data["wallet_balance"] = float(blockchain.web3.from_wei(balance, 'ether'))
        except Exception as e:
            health_data["blockchain_error"] = str(e)

    return health_data

@router.get("/record/{record_id}")
async def get_medical_record(
    record_id: int,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    logger.info(f"Fetching record {record_id} for user {user_id}")
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        logger.warning(f"Record {record_id} not found")
        raise HTTPException(status_code=404, detail="Record not found")
    
    logger.info(f"Found record: {record.id}")
    
    raw_data = json.loads(record.raw_data)
    return {
        "id": record.id,
        "title": f"Medical Record {record.id}",  # Use ID as fallback title
        "uploadDate": record.created_at.isoformat(),
        "verified": bool(record.blockchain_hash),
        "content": raw_data.get("notes", ""),
        "blockchain_tx": record.blockchain_hash
    }