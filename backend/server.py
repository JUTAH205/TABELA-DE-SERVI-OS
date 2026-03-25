from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os, logging, uuid, jwt
from pathlib import Path
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = "pm_horta_secret_2026"
JWT_ALG = "HS256"

USERS = {
    "HORTA": {"password": "HORTA123", "unidade": "HT", "role": "user", "nome": "PM Horta"},
    "PICO": {"password": "PICO123", "unidade": "SR", "role": "user", "nome": "PM Sao Roque do Pico"},
    "VELAS": {"password": "VELAS123", "unidade": "VE", "role": "user", "nome": "PM Velas"},
    "ADMIN": {"password": "ADMIN123", "unidade": "ALL", "role": "admin", "nome": "Administrador"},
}

app = FastAPI()
api = APIRouter(prefix="/api")

# === AUTH ===
class LoginReq(BaseModel):
    username: str
    password: str

class TokenResp(BaseModel):
    token: str
    username: str
    unidade: str
    role: str
    nome: str

def create_token(username, unidade, role):
    payload = {"sub": username, "unidade": unidade, "role": role, "exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token em falta")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return {"username": payload["sub"], "unidade": payload["unidade"], "role": payload["role"]}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except Exception:
        raise HTTPException(status_code=401, detail="Token invalido")

@api.post("/auth/login", response_model=TokenResp)
async def login(req: LoginReq):
    u = req.username.upper()
    user = USERS.get(u)
    if not user or user["password"] != req.password:
        raise HTTPException(status_code=401, detail="Credenciais invalidas")
    token = create_token(u, user["unidade"], user["role"])
    return TokenResp(token=token, username=u, unidade=user["unidade"], role=user["role"], nome=user["nome"])

@api.get("/auth/me")
async def get_me(user=Depends(get_current_user)):
    return user

# === MODELS ===
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
    viatura_ligeira: float = 0
    agentes: List[AgenteModel] = []
    responsavel: str = ""

class ServicoResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = ""
    numero_servico: int = 0
    numero_controlo: str = ""
    tipo_formulario: str = ""
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
    viatura_ligeira: float = 0
    agentes: List[AgenteModel] = []
    responsavel: str = ""
    created_at: str = ""
    updated_at: str = ""

# === HELPERS ===
async def gen_numero_controlo(year):
    regex = f"^{year}/"
    last = await db.servicos.find_one({"numero_controlo": {"$regex": regex}}, {"_id": 0, "numero_controlo": 1}, sort=[("numero_controlo", -1)])
    seq = 1
    if last and last.get("numero_controlo"):
        try: seq = int(last["numero_controlo"].split("/")[1]) + 1
        except: pass
    return f"{year}/{seq:04d}"

def unit_query(user, base_query=None):
    q = base_query or {}
    if user["role"] != "admin":
        q["comando_posto"] = user["unidade"]
    return q

# === SERVIÇOS ===
@api.get("/servicos/proximo-numero")
async def get_proximo_numero(user=Depends(get_current_user)):
    last = await db.servicos.find_one(sort=[("numero_servico", -1)], projection={"_id": 0, "numero_servico": 1})
    next_num = (last["numero_servico"] + 1) if last else 1
    year = datetime.now(timezone.utc).year
    nc = await gen_numero_controlo(year)
    return {"proximo_numero": next_num, "proximo_numero_controlo": nc}

@api.post("/servicos", response_model=ServicoResponse)
async def create_servico(data: ServicoCreate, user=Depends(get_current_user)):
    last = await db.servicos.find_one(sort=[("numero_servico", -1)], projection={"_id": 0, "numero_servico": 1})
    next_num = (last["numero_servico"] + 1) if last else 1
    year = datetime.now(timezone.utc).year
    if data.data:
        try: year = int(data.data[:4])
        except: pass
    nc = await gen_numero_controlo(year)
    now = datetime.now(timezone.utc).isoformat()
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["numero_servico"] = next_num
    doc["numero_controlo"] = nc
    if user["role"] != "admin":
        doc["comando_posto"] = user["unidade"]
    doc["created_at"] = now
    doc["updated_at"] = now
    if data.atividade:
        ex = await db.atividades.find_one({"nome": data.atividade, "tipo": data.tipo_formulario, "unidade": doc["comando_posto"]})
        if not ex:
            await db.atividades.insert_one({"nome": data.atividade, "tipo": data.tipo_formulario, "unidade": doc["comando_posto"]})
    await db.servicos.insert_one(doc)
    doc.pop("_id", None)
    return ServicoResponse(**doc)

@api.get("/servicos", response_model=List[ServicoResponse])
async def list_servicos(tipo: Optional[str] = Query(None), comando: Optional[str] = Query(None), search: Optional[str] = Query(None), data_inicio: Optional[str] = Query(None), data_fim: Optional[str] = Query(None), navio: Optional[str] = Query(None), utente: Optional[str] = Query(None), user=Depends(get_current_user)):
    query = {}
    if user["role"] != "admin":
        pass  # All services visible globally for table/map
    if tipo: query["tipo_formulario"] = tipo
    if comando: query["comando_posto"] = comando
    if search:
        query["$or"] = [{"utente": {"$regex": search, "$options": "i"}}, {"navio": {"$regex": search, "$options": "i"}}, {"numero_controlo": {"$regex": search, "$options": "i"}}]
    if navio: query["navio"] = {"$regex": navio, "$options": "i"}
    if utente and not search: query["utente"] = {"$regex": utente, "$options": "i"}
    if data_inicio and data_fim: query["data"] = {"$gte": data_inicio, "$lte": data_fim}
    elif data_inicio: query["data"] = {"$gte": data_inicio}
    elif data_fim: query["data"] = {"$lte": data_fim}
    docs = await db.servicos.find(query, {"_id": 0}).sort("numero_servico", -1).to_list(5000)
    return [ServicoResponse(**d) for d in docs]

@api.get("/servicos/{sid}", response_model=ServicoResponse)
async def get_servico(sid: str, user=Depends(get_current_user)):
    doc = await db.servicos.find_one({"id": sid}, {"_id": 0})
    if not doc: raise HTTPException(404, "Nao encontrado")
    return ServicoResponse(**doc)

@api.put("/servicos/{sid}", response_model=ServicoResponse)
async def update_servico(sid: str, data: ServicoCreate, user=Depends(get_current_user)):
    ex = await db.servicos.find_one({"id": sid}, {"_id": 0})
    if not ex: raise HTTPException(404, "Nao encontrado")
    upd = data.model_dump()
    upd["updated_at"] = datetime.now(timezone.utc).isoformat()
    if data.atividade:
        posto = upd.get("comando_posto", ex.get("comando_posto", ""))
        exa = await db.atividades.find_one({"nome": data.atividade, "tipo": data.tipo_formulario, "unidade": posto})
        if not exa:
            await db.atividades.insert_one({"nome": data.atividade, "tipo": data.tipo_formulario, "unidade": posto})
    await db.servicos.update_one({"id": sid}, {"$set": upd})
    updated = await db.servicos.find_one({"id": sid}, {"_id": 0})
    return ServicoResponse(**updated)

@api.delete("/servicos/{sid}")
async def delete_servico(sid: str, user=Depends(get_current_user)):
    r = await db.servicos.delete_one({"id": sid})
    if r.deleted_count == 0: raise HTTPException(404, "Nao encontrado")
    return {"message": "Eliminado"}

@api.get("/atividades")
async def list_atividades(tipo: Optional[str] = Query(None), user=Depends(get_current_user)):
    query = {}
    if tipo: query["tipo"] = tipo
    if user["role"] != "admin": query["unidade"] = user["unidade"]
    docs = await db.atividades.find(query, {"_id": 0}).to_list(500)
    return [d["nome"] for d in docs]

@api.get("/servicos-kpi")
async def servicos_kpi(user=Depends(get_current_user)):
    q = {}
    if user["role"] != "admin": q["comando_posto"] = user["unidade"]
    navios = await db.servicos.count_documents({**q, "tipo_formulario": "navios"})
    polic = await db.servicos.count_documents({**q, "tipo_formulario": "policiamentos"})
    return {"navios": navios, "policiamentos": polic}

# === DASHBOARD ===
@api.get("/dashboard/stats")
async def dashboard_stats(user=Depends(get_current_user)):
    total = await db.servicos.count_documents({})
    navios = await db.servicos.count_documents({"tipo_formulario": "navios"})
    polic = await db.servicos.count_documents({"tipo_formulario": "policiamentos"})
    fisc_total = await db.fiscalizacoes.count_documents({})
    pipeline = [{"$group": {"_id": "$comando_posto", "count": {"$sum": 1}}}, {"$sort": {"_id": 1}}]
    by_posto = {}
    async for d in db.servicos.aggregate(pipeline):
        if d["_id"]: by_posto[d["_id"]] = d["count"]
    now = datetime.now(timezone.utc)
    monthly = []
    for m in range(1, 13):
        ms = f"{now.year}-{m:02d}"
        c = await db.servicos.count_documents({"data": {"$regex": f"^{ms}"}})
        monthly.append({"mes": m, "count": c})
    return {"total": total, "navios": navios, "policiamentos": polic, "fiscalizacoes": fisc_total, "por_posto": by_posto, "mensal": monthly}

@api.get("/relatorio")
async def relatorio(tipo: Optional[str] = Query(None), comando: Optional[str] = Query(None), data_inicio: Optional[str] = Query(None), data_fim: Optional[str] = Query(None), atividade: Optional[str] = Query(None), utente: Optional[str] = Query(None), navio: Optional[str] = Query(None), user=Depends(get_current_user)):
    q = {}
    if tipo: q["tipo_formulario"] = tipo
    if comando: q["comando_posto"] = comando
    if atividade: q["atividade"] = {"$regex": atividade, "$options": "i"}
    if utente: q["utente"] = {"$regex": utente, "$options": "i"}
    if navio: q["navio"] = {"$regex": navio, "$options": "i"}
    if data_inicio and data_fim: q["data"] = {"$gte": data_inicio, "$lte": data_fim}
    elif data_inicio: q["data"] = {"$gte": data_inicio}
    elif data_fim: q["data"] = {"$lte": data_fim}
    docs = await db.servicos.find(q, {"_id": 0}).sort("data", 1).to_list(5000)
    results = [ServicoResponse(**d) for d in docs]
    by_tipo, by_posto, by_ativ = {}, {}, {}
    for r in results:
        by_tipo[r.tipo_formulario] = by_tipo.get(r.tipo_formulario, 0) + 1
        if r.comando_posto: by_posto[r.comando_posto] = by_posto.get(r.comando_posto, 0) + 1
        if r.atividade: by_ativ[r.atividade] = by_ativ.get(r.atividade, 0) + 1
    return {"total": len(results), "por_tipo": by_tipo, "por_posto": by_posto, "por_atividade": by_ativ, "servicos": [r.model_dump() for r in results]}

# === FISCALIZAÇÃO ===
TIPOS_FISCALIZACAO = {
    "pesca_ludica": "Pesca Ludica",
    "caca_submarina": "Caca Submarina",
    "pesca_profissional": "Pesca Profissional",
    "recreio": "Recreio",
    "maritimo_turistica": "Maritimo-Turistica",
    "operador_mt": "Operador MT",
    "apanha_profissional": "Apanha Profissional",
    "tl_reb_auxl": "TL/Reboque/Aux. Local",
}

class FiscalizacaoCreate(BaseModel):
    tipo_atividade: str
    data: str = ""
    hora: str = ""
    gps_n: str = ""
    gps_w: str = ""
    local: str = ""
    status: str = "legal"
    # Tab 1: Identificação
    timoneiro_nome: str = ""
    timoneiro_estado_civil: str = ""
    timoneiro_morada: str = ""
    timoneiro_cc: str = ""
    timoneiro_cc_validade: str = ""
    timoneiro_data_nasc: str = ""
    timoneiro_contato: str = ""
    timoneiro_naturalidade: str = ""
    timoneiro_profissao: str = ""
    timoneiro_nif: str = ""
    timoneiro_filiacao: str = ""
    timoneiro_carta: str = ""
    timoneiro_im: str = ""
    timoneiro_categoria: str = ""
    timoneiro_carta_validade: str = ""
    mesmo_proprietario: bool = False
    proprietario_nome: str = ""
    proprietario_nif: str = ""
    proprietario_morada: str = ""
    proprietario_cc: str = ""
    proprietario_cc_validade: str = ""
    proprietario_data_nasc: str = ""
    proprietario_contato: str = ""
    # Tab 2: Embarcação/Motor
    embarcacao_nome: str = ""
    embarcacao_con_id: str = ""
    embarcacao_call_sign: str = ""
    motor1_marca: str = ""
    motor1_serie: str = ""
    motor1_potencia: str = ""
    motor2_marca: str = ""
    motor2_serie: str = ""
    motor2_potencia: str = ""
    # Tab 3: Documentos
    documentos: dict = {}
    # Tab 4: Palamenta/Segurança
    meios_salvacao: dict = {}
    # Tab 5: Atividade/Capturas
    licenca_num: str = ""
    licenca_validade: str = ""
    licenca_tipo: str = ""
    especies: list = []
    artes: list = []
    infracoes: dict = {}
    # Radio
    radio_op_nome: str = ""
    radio_op_num: str = ""
    radio_op_categoria: str = ""
    radio_op_validade: str = ""
    # MT specific
    licenca_mt_num: str = ""
    licenca_mt_validade: str = ""
    atividades_autorizadas: str = ""
    seguros: list = []
    autorizacao_cetaceos_validade: str = ""
    # Operador MT
    operador_nome: str = ""
    operador_nif: str = ""
    operador_morada: str = ""
    operador_cae: str = ""
    operador_contato: str = ""
    operador_licenca_num: str = ""
    operador_licenca_validade: str = ""
    embarcacoes_associadas: list = []
    # Tab 6: Observações
    observacoes: str = ""

class FiscalizacaoResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = ""
    numero_fiscalizacao: str = ""
    tipo_atividade: str = ""
    tipo_atividade_label: str = ""
    unidade: str = ""
    data: str = ""
    hora: str = ""
    gps_n: str = ""
    gps_w: str = ""
    local: str = ""
    status: str = "legal"
    timoneiro_nome: str = ""
    timoneiro_estado_civil: str = ""
    timoneiro_morada: str = ""
    timoneiro_cc: str = ""
    timoneiro_cc_validade: str = ""
    timoneiro_data_nasc: str = ""
    timoneiro_contato: str = ""
    timoneiro_naturalidade: str = ""
    timoneiro_profissao: str = ""
    timoneiro_nif: str = ""
    timoneiro_filiacao: str = ""
    timoneiro_carta: str = ""
    timoneiro_im: str = ""
    timoneiro_categoria: str = ""
    timoneiro_carta_validade: str = ""
    mesmo_proprietario: bool = False
    proprietario_nome: str = ""
    proprietario_nif: str = ""
    proprietario_morada: str = ""
    proprietario_cc: str = ""
    proprietario_cc_validade: str = ""
    proprietario_data_nasc: str = ""
    proprietario_contato: str = ""
    embarcacao_nome: str = ""
    embarcacao_con_id: str = ""
    embarcacao_call_sign: str = ""
    motor1_marca: str = ""
    motor1_serie: str = ""
    motor1_potencia: str = ""
    motor2_marca: str = ""
    motor2_serie: str = ""
    motor2_potencia: str = ""
    documentos: dict = {}
    meios_salvacao: dict = {}
    licenca_num: str = ""
    licenca_validade: str = ""
    licenca_tipo: str = ""
    especies: list = []
    artes: list = []
    infracoes: dict = {}
    radio_op_nome: str = ""
    radio_op_num: str = ""
    radio_op_categoria: str = ""
    radio_op_validade: str = ""
    licenca_mt_num: str = ""
    licenca_mt_validade: str = ""
    atividades_autorizadas: str = ""
    seguros: list = []
    autorizacao_cetaceos_validade: str = ""
    operador_nome: str = ""
    operador_nif: str = ""
    operador_morada: str = ""
    operador_cae: str = ""
    operador_contato: str = ""
    operador_licenca_num: str = ""
    operador_licenca_validade: str = ""
    embarcacoes_associadas: list = []
    observacoes: str = ""
    created_at: str = ""
    updated_at: str = ""

async def gen_fisc_numero(tipo, year):
    prefix = tipo.upper().replace("_", " ")[:2]
    regex = f"^{prefix}-"
    last = await db.fiscalizacoes.find_one(
        {"numero_fiscalizacao": {"$regex": f"{regex}.*/{year}"}},
        {"_id": 0, "numero_fiscalizacao": 1},
        sort=[("numero_fiscalizacao", -1)]
    )
    seq = 1
    if last:
        try: seq = int(last["numero_fiscalizacao"].split("-")[1].split("/")[0]) + 1
        except: pass
    return f"{prefix}-{seq:03d}/{year}"

@api.get("/fiscalizacoes/tipos")
async def fisc_tipos():
    return TIPOS_FISCALIZACAO

@api.get("/fiscalizacoes/proximo-numero")
async def fisc_proximo(tipo: str = Query(...), user=Depends(get_current_user)):
    year = datetime.now(timezone.utc).year
    num = await gen_fisc_numero(tipo, year)
    return {"proximo_numero": num}

@api.post("/fiscalizacoes", response_model=FiscalizacaoResponse)
async def create_fisc(data: FiscalizacaoCreate, user=Depends(get_current_user)):
    year = datetime.now(timezone.utc).year
    if data.data:
        try: year = int(data.data[:4])
        except: pass
    num = await gen_fisc_numero(data.tipo_atividade, year)
    now = datetime.now(timezone.utc).isoformat()
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["numero_fiscalizacao"] = num
    doc["tipo_atividade_label"] = TIPOS_FISCALIZACAO.get(data.tipo_atividade, data.tipo_atividade)
    doc["unidade"] = user["unidade"] if user["role"] != "admin" else (doc.get("unidade") or "HT")
    doc["created_at"] = now
    doc["updated_at"] = now
    await db.fiscalizacoes.insert_one(doc)
    doc.pop("_id", None)
    return FiscalizacaoResponse(**doc)

@api.get("/fiscalizacoes", response_model=List[FiscalizacaoResponse])
async def list_fisc(tipo: Optional[str] = Query(None), unidade: Optional[str] = Query(None), status: Optional[str] = Query(None), data_inicio: Optional[str] = Query(None), data_fim: Optional[str] = Query(None), search: Optional[str] = Query(None), user=Depends(get_current_user)):
    q = {}
    if tipo: q["tipo_atividade"] = tipo
    if unidade: q["unidade"] = unidade
    if status: q["status"] = status
    if search:
        q["$or"] = [
            {"timoneiro_nome": {"$regex": search, "$options": "i"}},
            {"embarcacao_nome": {"$regex": search, "$options": "i"}},
            {"numero_fiscalizacao": {"$regex": search, "$options": "i"}},
            {"proprietario_nome": {"$regex": search, "$options": "i"}},
        ]
    if data_inicio and data_fim: q["data"] = {"$gte": data_inicio, "$lte": data_fim}
    elif data_inicio: q["data"] = {"$gte": data_inicio}
    elif data_fim: q["data"] = {"$lte": data_fim}
    docs = await db.fiscalizacoes.find(q, {"_id": 0}).sort("created_at", -1).to_list(5000)
    return [FiscalizacaoResponse(**d) for d in docs]

@api.get("/fiscalizacoes/{fid}", response_model=FiscalizacaoResponse)
async def get_fisc(fid: str, user=Depends(get_current_user)):
    doc = await db.fiscalizacoes.find_one({"id": fid}, {"_id": 0})
    if not doc: raise HTTPException(404, "Nao encontrado")
    return FiscalizacaoResponse(**doc)

@api.put("/fiscalizacoes/{fid}", response_model=FiscalizacaoResponse)
async def update_fisc(fid: str, data: FiscalizacaoCreate, user=Depends(get_current_user)):
    ex = await db.fiscalizacoes.find_one({"id": fid}, {"_id": 0})
    if not ex: raise HTTPException(404, "Nao encontrado")
    upd = data.model_dump()
    upd["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.fiscalizacoes.update_one({"id": fid}, {"$set": upd})
    updated = await db.fiscalizacoes.find_one({"id": fid}, {"_id": 0})
    return FiscalizacaoResponse(**updated)

@api.delete("/fiscalizacoes/{fid}")
async def delete_fisc(fid: str, user=Depends(get_current_user)):
    r = await db.fiscalizacoes.delete_one({"id": fid})
    if r.deleted_count == 0: raise HTTPException(404, "Nao encontrado")
    return {"message": "Eliminado"}

@api.get("/fiscalizacoes-stats")
async def fisc_stats(user=Depends(get_current_user)):
    total = await db.fiscalizacoes.count_documents({})
    legal = await db.fiscalizacoes.count_documents({"status": "legal"})
    infracao = await db.fiscalizacoes.count_documents({"status": "infracao"})
    pipeline = [{"$group": {"_id": "$tipo_atividade", "count": {"$sum": 1}}}]
    by_tipo = {}
    async for d in db.fiscalizacoes.aggregate(pipeline):
        if d["_id"]: by_tipo[d["_id"]] = d["count"]
    return {"total": total, "legal": legal, "infracao": infracao, "por_tipo": by_tipo}

# === SETUP ===
app.include_router(api)
app.add_middleware(CORSMiddleware, allow_credentials=True, allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','), allow_methods=["*"], allow_headers=["*"])
logging.basicConfig(level=logging.INFO)

@app.on_event("shutdown")
async def shutdown():
    client.close()
