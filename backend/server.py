from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# --- Models ---

class AgenteModel(BaseModel):
    nome: str = ""
    gdh_inicio_dia: str = ""
    gdh_inicio_hora: str = ""
    gdh_fim_dia: str = ""
    gdh_fim_hora: str = ""
    visita_entrada: int = 0
    visita_saida: int = 0
    svc_p_req: int = 0
    svc_p_imp: int = 0
    svc_np_req: int = 0
    svc_np_imp: int = 0
    # Police-specific fields
    gdh_servico: str = ""
    req_p_noturno_4h: int = 0
    req_p_diurno_4h: int = 0
    req_p_sdf: int = 0
    req_np_noturno_4h: int = 0
    req_np_diurno_4h: int = 0
    req_np_sdf: int = 0
    imp_p_noturno_4h: int = 0
    imp_p_diurno_4h: int = 0
    imp_p_sdf: int = 0
    imp_np_noturno_4h: int = 0
    imp_np_diurno_4h: int = 0
    imp_np_sdf: int = 0

class ServicoCreate(BaseModel):
    tipo_formulario: str  # "navios" or "policiamentos"
    comando_posto: str = ""
    data: str = ""
    utente: str = ""
    despacho: str = ""
    numero_controlo: str = ""
    atividade: str = ""
    navio: str = ""
    deslocacao_km: float = 0
    # Escala de Navios
    visita: int = 0
    p_req: int = 0
    p_imp: int = 0
    np_req: int = 0
    np_imp: int = 0
    # Policiamento Requisitado
    pol_req_p_diurno_4h: int = 0
    pol_req_p_diurno_h: int = 0
    pol_req_p_noturno_4h: int = 0
    pol_req_p_noturno_h: int = 0
    pol_req_np_diurno_4h: int = 0
    pol_req_np_diurno_h: int = 0
    pol_req_np_noturno_4h: int = 0
    pol_req_np_noturno_h: int = 0
    # Policiamento Imposto
    pol_imp_p_diurno_4h: int = 0
    pol_imp_p_diurno_h: int = 0
    pol_imp_p_noturno_4h: int = 0
    pol_imp_p_noturno_h: int = 0
    pol_imp_np_diurno_4h: int = 0
    pol_imp_np_diurno_h: int = 0
    pol_imp_np_noturno_4h: int = 0
    pol_imp_np_noturno_h: int = 0
    # Extras
    pericias: int = 0
    agravamento: float = 0
    # Empenhamento
    bote: float = 0
    lancha: float = 0
    moto_agua: float = 0
    viatura_4x4: float = 0
    moto_4: float = 0
    deslocacao: float = 0
    # Agents
    agentes: List[AgenteModel] = []
    # Meta
    responsavel: str = ""

class ServicoResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    numero_servico: int
    tipo_formulario: str
    comando_posto: str = ""
    data: str = ""
    utente: str = ""
    despacho: str = ""
    numero_controlo: str = ""
    atividade: str = ""
    navio: str = ""
    deslocacao_km: float = 0
    visita: int = 0
    p_req: int = 0
    p_imp: int = 0
    np_req: int = 0
    np_imp: int = 0
    pol_req_p_diurno_4h: int = 0
    pol_req_p_diurno_h: int = 0
    pol_req_p_noturno_4h: int = 0
    pol_req_p_noturno_h: int = 0
    pol_req_np_diurno_4h: int = 0
    pol_req_np_diurno_h: int = 0
    pol_req_np_noturno_4h: int = 0
    pol_req_np_noturno_h: int = 0
    pol_imp_p_diurno_4h: int = 0
    pol_imp_p_diurno_h: int = 0
    pol_imp_p_noturno_4h: int = 0
    pol_imp_p_noturno_h: int = 0
    pol_imp_np_diurno_4h: int = 0
    pol_imp_np_diurno_h: int = 0
    pol_imp_np_noturno_4h: int = 0
    pol_imp_np_noturno_h: int = 0
    pericias: int = 0
    agravamento: float = 0
    bote: float = 0
    lancha: float = 0
    moto_agua: float = 0
    viatura_4x4: float = 0
    moto_4: float = 0
    deslocacao: float = 0
    agentes: List[AgenteModel] = []
    responsavel: str = ""
    created_at: str = ""
    updated_at: str = ""

# --- Endpoints ---

@api_router.get("/")
async def root():
    return {"message": "Polícia Marítima - API de Serviços"}

@api_router.get("/servicos/proximo-numero")
async def get_proximo_numero():
    last = await db.servicos.find_one(sort=[("numero_servico", -1)], projection={"_id": 0, "numero_servico": 1})
    next_num = (last["numero_servico"] + 1) if last else 1
    return {"proximo_numero": next_num}

@api_router.post("/servicos", response_model=ServicoResponse)
async def create_servico(input_data: ServicoCreate):
    last = await db.servicos.find_one(sort=[("numero_servico", -1)], projection={"_id": 0, "numero_servico": 1})
    next_num = (last["numero_servico"] + 1) if last else 1
    
    now = datetime.now(timezone.utc).isoformat()
    doc = input_data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["numero_servico"] = next_num
    doc["created_at"] = now
    doc["updated_at"] = now
    
    await db.servicos.insert_one(doc)
    # Remove MongoDB _id before returning
    doc.pop("_id", None)
    return ServicoResponse(**doc)

@api_router.get("/servicos", response_model=List[ServicoResponse])
async def list_servicos(
    tipo: Optional[str] = Query(None),
    comando: Optional[str] = Query(None),
    mes: Optional[int] = Query(None),
    ano: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
):
    query = {}
    if tipo:
        query["tipo_formulario"] = tipo
    if comando:
        query["comando_posto"] = comando
    if search:
        query["utente"] = {"$regex": search, "$options": "i"}
    if mes and ano:
        # Filter by month/year from the data field (ISO format YYYY-MM-DD)
        month_str = f"{ano}-{mes:02d}"
        query["data"] = {"$regex": f"^{month_str}"}
    
    docs = await db.servicos.find(query, {"_id": 0}).sort("numero_servico", -1).to_list(1000)
    return [ServicoResponse(**d) for d in docs]

@api_router.get("/servicos/{servico_id}", response_model=ServicoResponse)
async def get_servico(servico_id: str):
    doc = await db.servicos.find_one({"id": servico_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return ServicoResponse(**doc)

@api_router.put("/servicos/{servico_id}", response_model=ServicoResponse)
async def update_servico(servico_id: str, input_data: ServicoCreate):
    existing = await db.servicos.find_one({"id": servico_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    now = datetime.now(timezone.utc).isoformat()
    update_data = input_data.model_dump()
    update_data["updated_at"] = now
    
    await db.servicos.update_one(
        {"id": servico_id},
        {"$set": update_data}
    )
    
    updated = await db.servicos.find_one({"id": servico_id}, {"_id": 0})
    return ServicoResponse(**updated)

@api_router.delete("/servicos/{servico_id}")
async def delete_servico(servico_id: str):
    result = await db.servicos.delete_one({"id": servico_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return {"message": "Serviço eliminado com sucesso"}

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total = await db.servicos.count_documents({})
    navios = await db.servicos.count_documents({"tipo_formulario": "navios"})
    policiamentos = await db.servicos.count_documents({"tipo_formulario": "policiamentos"})
    
    # Count by command post
    pipeline = [
        {"$group": {"_id": "$comando_posto", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    by_posto = {}
    async for doc in db.servicos.aggregate(pipeline):
        if doc["_id"]:
            by_posto[doc["_id"]] = doc["count"]
    
    # Monthly counts for current year
    now = datetime.now(timezone.utc)
    monthly = []
    for m in range(1, 13):
        month_str = f"{now.year}-{m:02d}"
        count = await db.servicos.count_documents({"data": {"$regex": f"^{month_str}"}})
        monthly.append({"mes": m, "count": count})
    
    return {
        "total": total,
        "navios": navios,
        "policiamentos": policiamentos,
        "por_posto": by_posto,
        "mensal": monthly
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
