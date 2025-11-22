from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db
from models import Classe, Personagem, User, Magia, MagiaAprendida, RegraDado
from werkzeug.security import generate_password_hash, check_password_hash
import random

app = Flask(__name__)
CORS(app) # Permite conexão com o Frontend

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rpg_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# --- FUNÇÕES AUXILIARES ---

def criar_tabelas():
    with app.app_context():
        db.create_all()

# Lógica do Dado (Otimizada para retornar CamelCase)
def rolar_dados_logica(quantidade, faces, bonus):
    rolagens = []
    soma_resultados = 0 
    
    for _ in range(quantidade):
        resultado_dado = random.randint(1, faces)
        rolagens.append(resultado_dado)
        
        # Lógica do D20 (Pérola RPG)
        if faces == 20:
            regra = RegraDado.query.filter_by(numero_dado=resultado_dado).first()
            if regra:
                soma_resultados += regra.modificador
            else:
                soma_resultados += resultado_dado 
        else:
            soma_resultados += resultado_dado
            
    total_final = soma_resultados + bonus
    
    # Verifica Crítico e Falha
    critico = (20 in rolagens) if faces == 20 else False
    falha = (1 in rolagens) if faces == 20 else False

    return {
        "formula": f"{quantidade}d{faces} (Mods) + {bonus}",
        "rolagensIndividuais": rolagens,  # <--- CORRIGIDO PARA CAMELCASE
        "somaDados": soma_resultados,     # <--- CORRIGIDO PARA CAMELCASE
        "bonus": bonus,
        "totalFinal": total_final,        # <--- CORRIGIDO PARA CAMELCASE
        "critico": critico,
        "falhaCritica": falha             # <--- CORRIGIDO PARA CAMELCASE
    }

# --- ROTAS DE AUTENTICAÇÃO ---

@app.route('/register', methods=['POST'])
def registrar_usuario():
    dados = request.get_json()
    username = dados.get('username')
    password = dados.get('password')
    is_master = dados.get('is_master', False)

    if not username or not password:
        return jsonify({"erro": "Dados incompletos"}), 400
    
    if User.query.filter_by(username=username).first():
        return jsonify({"erro": "Usuário já existe"}), 409

    senha_hash = generate_password_hash(password)
    novo_user = User(username=username, password=senha_hash, is_master=is_master)
    
    db.session.add(novo_user)
    db.session.commit()

    return jsonify({"mensagem": "Usuário criado!", "id": novo_user.id}), 201

@app.route('/login', methods=['POST'])
def login_usuario():
    dados = request.get_json()
    user = User.query.filter_by(username=dados.get('username')).first()

    if user and check_password_hash(user.password, dados.get('password')):
        return jsonify({
            "mensagem": "Login realizado!",
            "user_id": user.id,
            "is_master": user.is_master,
            "username": user.username
        }), 200
    
    return jsonify({"erro": "Credenciais inválidas"}), 401

# --- ROTAS DE PERSONAGEM ---

@app.route('/meu-personagem', methods=['POST'])
def get_meu_personagem():
    user_id = request.get_json().get('user_id')
    personagem = Personagem.query.filter_by(user_id=user_id, is_dead=False).first()

    if personagem:
        return jsonify(personagem.to_dict()), 200
    return jsonify({"erro": "Personagem não encontrado"}), 404

@app.route('/criar-personagem', methods=['POST'])
def criar_personagem():
    dados = request.get_json()
    user_id = dados.get('user_id')
    nome = dados.get('nome')
    classe_id = dados.get('classe_id', 1)

    if not nome or not user_id:
        return jsonify({"erro": "Dados incompletos"}), 400

    if Personagem.query.filter_by(user_id=user_id, is_dead=False).first():
        return jsonify({"erro": "Você já tem um personagem vivo."}), 403

    novo_char = Personagem(nome=nome, historia=dados.get('historia'), user_id=user_id, classe_id=classe_id)
    
    # Adiciona Magias da Classe (Kit Inicial)
    classe_do_char = Classe.query.get(classe_id)
    if classe_do_char:
        for magia in classe_do_char.magias_iniciais:
            novo_char.grimorio.append(MagiaAprendida(info_magia=magia, nivel=1))

    try:
        db.session.add(novo_char)
        db.session.commit()
        return jsonify({"mensagem": "Criado!", "id": novo_char.id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

@app.route('/classes', methods=['GET'])
def listar_classes():
    return jsonify([c.to_dict() for c in Classe.query.all()]), 200

# --- ROTAS DE MAGIA ---

@app.route('/meu-grimorio/<int:personagem_id>', methods=['GET'])
def ver_grimorio(personagem_id):
    personagem = Personagem.query.get(personagem_id)
    if not personagem: return jsonify({"erro": "Personagem não encontrado"}), 404
    return jsonify([m.to_dict() for m in personagem.grimorio]), 200

@app.route('/habilidades/<int:id_personagem>/<nome_magia>', methods=['PUT'])
def upar_magia_com_media(id_personagem, nome_magia):
    personagem = Personagem.query.get(id_personagem)
    if not personagem: return jsonify({"erro": "Personagem não encontrado"}), 404

    magia_alvo = next((m for m in personagem.grimorio if m.info_magia.nome == nome_magia), None)
    if not magia_alvo: return jsonify({"erro": "Magia não encontrada"}), 404

    # Lógica da Média
    novo_nivel = magia_alvo.nivel + 1
    total_magias = len(personagem.grimorio)
    
    if total_magias <= 1:
        magia_alvo.nivel = novo_nivel
        db.session.commit()
        return jsonify({"mensagem": "Upado (Solo)!"}), 200

    soma_niveis = sum(m.nivel for m in personagem.grimorio)
    media_atual = soma_niveis / total_magias
    
    if novo_nivel > (media_atual + 1.5):
        return jsonify({"erro": "Desequilíbrio!", "detalhe": f"Média atual: {media_atual:.1f}"}), 400

    magia_alvo.nivel = novo_nivel
    db.session.commit()
    return jsonify({"mensagem": f"Level Up! Nível {novo_nivel}"}), 200

# --- ROTAS GERAIS ---
@app.route('/rolar', methods=['POST'])
def rolar_api():
    dados = request.get_json()
    resultado = rolar_dados_logica(
        dados.get('qtd', 1), 
        dados.get('faces', 20), 
        dados.get('bonus', 0)
    )
    return jsonify(resultado)

# --- ADMIN ---
@app.route('/mestre/personagens', methods=['GET'])
def listar_todos_personagens():
    lista = []
    for p in Personagem.query.all():
        d = p.to_dict()
        d['id'] = p.id
        lista.append(d)
    return jsonify(lista), 200

if __name__ == '__main__':
    criar_tabelas()
    app.run(debug=True)