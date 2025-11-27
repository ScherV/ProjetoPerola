from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db
from models import (
    Classe, Personagem, User, Magia, MagiaAprendida, 
    RegraDado, AtributoDef, TalentoDef, FichaAtributo, FichaTalento, RegraBonusRank, Mapa
)
from werkzeug.security import generate_password_hash, check_password_hash
import random

app = Flask(__name__)
CORS(app) # Habilita conexão com Next.js

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rpg_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# --- FUNÇÕES AUXILIARES DE LÓGICA ---

def criar_tabelas():
    with app.app_context():
        db.create_all()

def inicializar_ficha_zerada(novo_personagem):
    """Cria a ficha técnica vazia (Atributos/Talentos zerados) para o novo personagem."""
    # 1. Cria Atributos
    for attr in AtributoDef.query.all():
        db.session.add(FichaAtributo(personagem=novo_personagem, info=attr, valor=0, rank="-"))
    # 2. Cria Talentos
    for tal in TalentoDef.query.all():
        db.session.add(FichaTalento(personagem=novo_personagem, info=tal, valor=0, rank="-"))
    db.session.commit()

def calcular_custo_evolucao(valor_atual, rank_letra, tipo="atributo"):
    if valor_atual < 5: return 25

    # Se o rank for "-", não tem bônus no banco, então usamos 0
    bonus = 0
    if rank_letra != "-":
        regra = RegraBonusRank.query.filter_by(rank=rank_letra).first()
        if regra:
            bonus = regra.bonus_atributo if tipo == "atributo" else regra.bonus_talento
    
    multiplicador = 7 if tipo == "atributo" else 5
    return int((valor_atual + bonus) * multiplicador)

LISTA_RANKS = ["-", "F", "E", "D", "C", "B", "A", "S", "Z"]

def processar_upgrade_pontos(valor_atual, rank_atual, pontos_ganhos):
    """
    Aplica a lógica de ciclo 1-9.
    Começa no Rank "-" -> Passou de 9 -> Vira Rank "F".
    """
    novo_total = valor_atual + pontos_ganhos
    novo_rank = rank_atual

    # Loop de evolução
    while novo_total > 9 and novo_rank != "Z":
        novo_total -= 9
        
        # Lógica de subir o Rank na lista
        if novo_rank in LISTA_RANKS:
            idx = LISTA_RANKS.index(novo_rank)
            if idx + 1 < len(LISTA_RANKS):
                novo_rank = LISTA_RANKS[idx + 1]
            else:
                # Se já era Z e estourou, mantém Z (e o valor acumula no final)
                break
    
    # Se for Z, deixa o valor subir até 999
    if novo_rank == "Z" and novo_total > 999:
        novo_total = 999 

    return novo_total, novo_rank

def rolar_dados_logica(quantidade, faces, bonus):
    """Rola dados aplicando a tabela de modificadores do Pérola."""
    rolagens = []
    soma_resultados = 0 
    
    for _ in range(quantidade):
        res = random.randint(1, faces)
        rolagens.append(res)
        
        if faces == 20:
            regra = RegraDado.query.filter_by(numero_dado=res).first()
            soma_resultados += regra.modificador if regra else res
        else:
            soma_resultados += res
            
    return {
        "formula": f"{quantidade}d{faces} + {bonus}",
        "rolagensIndividuais": rolagens,
        "somaDados": soma_resultados,
        "bonus": bonus,
        "totalFinal": soma_resultados + bonus,
        "critico": (20 in rolagens) if faces == 20 else False,
        "falhaCritica": (1 in rolagens) if faces == 20 else False
    }

# ================= ROTAS DA API =================

@app.route('/')
def home():
    return "<h1>🛡️ API do Pérola RPG Online!</h1>"

# --- AUTH ---
@app.route('/register', methods=['POST'])
def registrar():
    d = request.get_json()
    if User.query.filter_by(username=d.get('username')).first():
        return jsonify({"erro": "Usuário já existe"}), 409
    
    novo = User(
        username=d.get('username'), 
        password=generate_password_hash(d.get('password')), 
        is_master=d.get('is_master', False)
    )
    db.session.add(novo)
    db.session.commit()
    return jsonify({"mensagem": "Criado!"}), 201

@app.route('/login', methods=['POST'])
def login():
    d = request.get_json()
    u = User.query.filter_by(username=d.get('username')).first()
    if u and check_password_hash(u.password, d.get('password')):
        return jsonify({"user_id": u.id, "is_master": u.is_master, "username": u.username}), 200
    return jsonify({"erro": "Credenciais inválidas"}), 401

# --- PERSONAGEM ---
@app.route('/meu-personagem', methods=['POST'])
def get_personagem():
    p = Personagem.query.filter_by(user_id=request.get_json().get('user_id'), is_dead=False).first()
    return jsonify(p.to_dict()) if p else (jsonify({"erro": "Não encontrado"}), 404)

@app.route('/classes', methods=['GET'])
def listar_classes():
    return jsonify([c.to_dict() for c in Classe.query.all()]), 200

@app.route('/criar-personagem', methods=['POST'])
def criar_personagem():
    d = request.get_json()
    if Personagem.query.filter_by(user_id=d.get('user_id'), is_dead=False).first():
        return jsonify({"erro": "Já possui personagem vivo"}), 403

    novo = Personagem(nome=d.get('nome'), historia=d.get('historia'), user_id=d.get('user_id'), classe_id=d.get('classe_id', 1))
    
    # Kit Inicial de Magias
    classe = Classe.query.get(novo.classe_id)
    if classe:
        for m in classe.magias_iniciais:
            novo.grimorio.append(MagiaAprendida(info_magia=m, nivel=1))

    try:
        db.session.add(novo)
        db.session.commit()
        inicializar_ficha_zerada(novo) # Gera atributos zerados
        return jsonify({"mensagem": "Criado!", "id": novo.id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# --- EVOLUÇÃO (PONTOS) ---
@app.route('/tentar-evoluir', methods=['POST'])
def tentar_evoluir():
    d = request.get_json()
    tipo = d.get('tipo')
    
    # Busca o item correto
    item = FichaAtributo.query.get(d.get('id_vinculo')) if tipo == "atributo" else FichaTalento.query.get(d.get('id_vinculo'))
    
    if not item: return jsonify({"erro": "Item não encontrado"}), 404
    personagem = item.personagem

    # Calcula custo
    custo = calcular_custo_evolucao(item.valor, item.rank, tipo)
    if personagem.xp_livre < custo:
        return jsonify({"erro": "XP Insuficiente", "custo": custo}), 400

    # Transação
    personagem.xp_livre -= custo
    
    # Rola 10d10
    sucessos = 0
    rolagens = []
    aposta = d.get('aposta')
    
    for _ in range(10):
        res = random.randint(1, 10)
        rolagens.append(res)
        eh_par = (res % 2 == 0)
        if (aposta == "par" and eh_par) or (aposta == "impar" and not eh_par):
            sucessos += 1
    
    # Guarda o Rank antigo para comparar
    rank_antigo = item.rank

    # Aplica a Evolução
    item.valor, item.rank = processar_upgrade_pontos(item.valor, item.rank, sucessos)
    
    db.session.commit()
    
    # Verifica se subiu de Rank
    subiu_rank = item.rank != rank_antigo
    
    return jsonify({
        "mensagem": "Ritual Concluído!",
        "pontosGanhos": sucessos,
        "novoValor": item.valor,
        "novoRank": item.rank,
        "novoSaldo": personagem.xp_livre,
        "dados": rolagens,
        "subiuRank": subiu_rank, # <--- AVISO IMPORTANTE PRO FRONTEND
        "custo_pago": custo
    }), 200

# --- MAGIAS ---
@app.route('/meu-grimorio/<int:id>', methods=['GET'])
def ver_grimorio(id):
    p = Personagem.query.get(id)
    return jsonify([m.to_dict() for m in p.grimorio]) if p else (jsonify({"erro": "404"}), 404)

@app.route('/habilidades/<int:pid>/<nome>', methods=['PUT'])
def upar_magia(pid, nome):
    p = Personagem.query.get(pid)
    magia = next((m for m in p.grimorio if m.info_magia.nome == nome), None)
    if not magia: return jsonify({"erro": "Não encontrada"}), 404

    # Lógica da Média
    novo_lvl = magia.nivel + 1
    total = len(p.grimorio)
    if total > 1:
        media = sum(m.nivel for m in p.grimorio) / total
        if novo_lvl > (media + 1.5):
            return jsonify({"erro": "Desequilíbrio!", "detalhe": f"Média: {media:.1f}"}), 400

    magia.nivel = novo_lvl
    db.session.commit()
    return jsonify({"mensagem": "Level Up!"}), 200

# --- MESTRE / DADOS ---
@app.route('/rolar', methods=['POST'])
def rolar():
    d = request.get_json()
    return jsonify(rolar_dados_logica(d.get('qtd', 1), d.get('faces', 20), d.get('bonus', 0)))

@app.route('/mestre/personagens', methods=['GET'])
def listar_todos():
    return jsonify([dict(p.to_dict(), id=p.id) for p in Personagem.query.all()]), 200

@app.route('/desbloquear-mapa', methods=['POST'])
def desbloquear_mapa():
    data = request.get_json()
    personagem_id = data.get('personagem_id')
    mapa_id = data.get('mapa_id') # O ID do mapa (1, 2 ou 3)

    personagem = Personagem.query.get(personagem_id)
    mapa = Mapa.query.get(mapa_id)

    if not personagem or not mapa:
        return jsonify({"erro": "Dados inválidos"}), 404

    if mapa not in personagem.mapas:
        personagem.mapas.append(mapa)
        db.session.commit()
        return jsonify({"mensagem": f"Mapa '{mapa.nome}' desbloqueado!"}), 200
    
    return jsonify({"mensagem": "Personagem já possui este mapa."}), 200

if __name__ == '__main__':
    criar_tabelas()
    app.run(debug=True)