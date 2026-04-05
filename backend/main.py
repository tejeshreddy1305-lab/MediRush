from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routers import symptoms, hospitals, notifications, tracking, patients, auth
from websocket.manager import manager
from database import init_db
import json, logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medirush")

app = FastAPI(title="MediRush API", version="2.0.0",
              description="AI-Powered Emergency Healthcare Response System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001",
                   "http://127.0.0.1:3000", "http://127.0.0.1:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(symptoms.router)
app.include_router(hospitals.router)
app.include_router(notifications.router)
app.include_router(tracking.router)
app.include_router(patients.router)
app.include_router(auth.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "MediRush API v2.0", "websockets": "active"}

@app.get("/")
def root():
    return {"message": "MediRush Emergency Healthcare API", "docs": "/docs"}

@app.on_event("startup")
async def startup():
    init_db()
    logger.info("MediRush API started — database initialized")

@app.websocket("/ws/hospital/{hospital_id}")
async def hospital_ws(websocket: WebSocket, hospital_id: str):
    await manager.connect_hospital(websocket, hospital_id)
    logger.info(f"Hospital {hospital_id} connected via WebSocket")
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "DOCTOR_ACCEPTED":
                token = msg.get("token", "")
                await manager.broadcast_to_patient(token, json.dumps(msg))
            elif msg.get("type") == "BED_UPDATE":
                await manager.broadcast_to_hospital(hospital_id, json.dumps(msg))
    except WebSocketDisconnect:
        manager.disconnect_hospital(websocket, hospital_id)
        logger.info(f"Hospital {hospital_id} disconnected")

@app.websocket("/ws/patient/{token}")
async def patient_ws(websocket: WebSocket, token: str):
    await manager.connect_patient(websocket, token)
    logger.info(f"Patient {token} connected via WebSocket")
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg.get("type") == "LOCATION_UPDATE":
                hospital_id = msg.get("hospital_id", "")
                if hospital_id:
                    await manager.broadcast_to_hospital(hospital_id, json.dumps(msg))
    except WebSocketDisconnect:
        manager.disconnect_patient(websocket, token)
        logger.info(f"Patient {token} disconnected")

@app.websocket("/ws/tracking/{token}")
async def tracking_ws(websocket: WebSocket, token: str):
    await manager.connect_patient(websocket, token)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_patient(websocket, token)