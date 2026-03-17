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
    tipo_formulario: str
    comando_posto: str = ""
    data: str = ""
    utente: str = ""
    despacho: str = ""
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
    bote: float = 0
    lancha: float = 0
    moto_agua: float = 0
    viatura_4x4: float = 0
    moto_4: float = 0
    agentes: List[AgenteModel] = []
    responsavel: str = ""

class ServicoResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    numero_servico: int
    numero_controlo: str = ""
    tipo_formulario: str
    comando_posto: str = ""
    data: str = ""
    utente: str = ""
    despacho: str = ""
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
    bote: float = 0
    lancha: float = 0
    moto_agua: float = 0
    viatura_4x4: float = 0
    moto_4: float = 0
    agentes: List[AgenteModel] = []
    responsavel: str = ""
    created_at: str = ""
    updated_at: str = ""

# --- Helper: generate annual numero_controlo ---
async def generate_numero_controlo(year: int) -> str:
    # Find the highest numero_controlo for this year
    regex = f"^{year}/"
    last = await db.servicos.find_one(
        {"numero_controlo": {"$regex": regex}},
        {"_id": 0, "numero_controlo": 1},
        sort=[("numero_controlo", -1)]
    )
    if last and last.get("numero_controlo"):
        try:
            seq = int(last["numero_controlo"].split("/")[1]) + 1
        except (IndexError, ValueError):
            seq = 1
    else:
        seq = 1
    return f"{year}/{seq:04d}"

# --- Endpoints ---

@api_router.get("/")
async def root():
    return {"message": "Polícia Marítima - API de Serviços"}

@api_router.get("/servicos/proximo-numero")
async def get_proximo_numero():
    last = await db.servicos.find_one(sort=[("numero_servico", -1)], projection={"_id": 0, "numero_servico": 1})
    next_num = (last["numero_servico"] + 1) if last else 1
    year = datetime.now(timezone.utc).year
    nc = await generate_numero_controlo(year)
    return {"proximo_numero": next_num, "proximo_numero_controlo": nc}

@api_router.post("/servicos", response_model=ServicoResponse)
async def create_servico(input_data: ServicoCreate):
    last = await db.servicos.find_one(sort=[("numero_servico", -1)], projection={"_id": 0, "numero_servico": 1})
    next_num = (last["numero_servico"] + 1) if last else 1

    # Determine year from service date or current
    year = datetime.now(timezone.utc).year
    if input_data.data:
        try:
            year = int(input_data.data[:4])
        except (ValueError, IndexError):
            pass
    nc = await generate_numero_controlo(year)

    now = datetime.now(timezone.utc).isoformat()
    doc = input_data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["numero_servico"] = next_num
    doc["numero_controlo"] = nc
    doc["created_at"] = now
    doc["updated_at"] = now

    # Save atividade to the atividades collection if new
    if input_data.atividade:
        existing_at = await db.atividades.find_one({"nome": input_data.atividade, "tipo": input_data.tipo_formulario})
        if not existing_at:
            await db.atividades.insert_one({"nome": input_data.atividade, "tipo": input_data.tipo_formulario})

    await db.servicos.insert_one(doc)
    doc.pop("_id", None)
    return ServicoResponse(**doc)

@api_router.get("/servicos", response_model=List[ServicoResponse])
async def list_servicos(
    tipo: Optional[str] = Query(None),
    comando: Optional[str] = Query(None),
    mes: Optional[int] = Query(None),
    ano: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    data_inicio: Optional[str] = Query(None),
    data_fim: Optional[str] = Query(None),
):
    query = {}
    if tipo:
        query["tipo_formulario"] = tipo
    if comando:
        query["comando_posto"] = comando
    if search:
        query["$or"] = [
            {"utente": {"$regex": search, "$options": "i"}},
            {"navio": {"$regex": search, "$options": "i"}},
            {"numero_controlo": {"$regex": search, "$options": "i"}},
        ]
    if mes and ano:
        month_str = f"{ano}-{mes:02d}"
        query["data"] = {"$regex": f"^{month_str}"}
    elif data_inicio and data_fim:
        query["data"] = {"$gte": data_inicio, "$lte": data_fim}
    elif data_inicio:
        query["data"] = {"$gte": data_inicio}
    elif data_fim:
        query["data"] = {"$lte": data_fim}

    docs = await db.servicos.find(query, {"_id": 0}).sort("numero_servico", -1).to_list(5000)
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

    # Save new atividade if needed
    if input_data.atividade:
        existing_at = await db.atividades.find_one({"nome": input_data.atividade, "tipo": input_data.tipo_formulario})
        if not existing_at:
            await db.atividades.insert_one({"nome": input_data.atividade, "tipo": input_data.tipo_formulario})

    await db.servicos.update_one({"id": servico_id}, {"$set": update_data})
    updated = await db.servicos.find_one({"id": servico_id}, {"_id": 0})
    return ServicoResponse(**updated)

@api_router.delete("/servicos/{servico_id}")
async def delete_servico(servico_id: str):
    result = await db.servicos.delete_one({"id": servico_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    return {"message": "Serviço eliminado com sucesso"}

# --- Atividades ---

@api_router.get("/atividades")
async def list_atividades(tipo: Optional[str] = Query(None)):
    query = {}
    if tipo:
        query["tipo"] = tipo
    docs = await db.atividades.find(query, {"_id": 0}).to_list(500)
    return [d["nome"] for d in docs]

@api_router.post("/atividades")
async def create_atividade(nome: str = Query(...), tipo: str = Query(...)):
    existing = await db.atividades.find_one({"nome": nome, "tipo": tipo})
    if not existing:
        await db.atividades.insert_one({"nome": nome, "tipo": tipo})
    return {"message": "ok"}

# --- Dashboard ---

@api_router.get("/dashboard/stats")
async def get_dashboard_stats():
    total = await db.servicos.count_documents({})
    navios = await db.servicos.count_documents({"tipo_formulario": "navios"})
    policiamentos = await db.servicos.count_documents({"tipo_formulario": "policiamentos"})

    pipeline = [
        {"$group": {"_id": "$comando_posto", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    by_posto = {}
    async for doc in db.servicos.aggregate(pipeline):
        if doc["_id"]:
            by_posto[doc["_id"]] = doc["count"]

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

# --- Relatorio ---

@api_router.get("/relatorio")
async def get_relatorio(
    tipo: Optional[str] = Query(None),
    comando: Optional[str] = Query(None),
    data_inicio: Optional[str] = Query(None),
    data_fim: Optional[str] = Query(None),
    atividade: Optional[str] = Query(None),
    utente: Optional[str] = Query(None),
):
    query = {}
    if tipo:
        query["tipo_formulario"] = tipo
    if comando:
        query["comando_posto"] = comando
    if atividade:
        query["atividade"] = {"$regex": atividade, "$options": "i"}
    if utente:
        query["utente"] = {"$regex": utente, "$options": "i"}
    if data_inicio and data_fim:
        query["data"] = {"$gte": data_inicio, "$lte": data_fim}
    elif data_inicio:
        query["data"] = {"$gte": data_inicio}
    elif data_fim:
        query["data"] = {"$lte": data_fim}

    docs = await db.servicos.find(query, {"_id": 0}).sort("data", 1).to_list(5000)
    results = [ServicoResponse(**d) for d in docs]

    # Summary stats
    total = len(results)
    by_tipo = {}
    by_posto = {}
    by_atividade = {}
    for r in results:
        by_tipo[r.tipo_formulario] = by_tipo.get(r.tipo_formulario, 0) + 1
        if r.comando_posto:
            by_posto[r.comando_posto] = by_posto.get(r.comando_posto, 0) + 1
        if r.atividade:
            by_atividade[r.atividade] = by_atividade.get(r.atividade, 0) + 1

    return {
        "total": total,
        "por_tipo": by_tipo,
        "por_posto": by_posto,
        "por_atividade": by_atividade,
        "servicos": [r.model_dump() for r in results],
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
