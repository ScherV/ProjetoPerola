from flask import Flask, jsonify, request
from flask_cors import CORS
from database import db
from models import Classe, Personagem, User, Magia, MagiaAprendida
from werkzeug.security import generate_password_hash, check_password_hash
import random

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///rpg_database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

def rolarDadosLogica(quantidade, faces, bonus):

    rolagens = []
    somaDados = 0

    for _ in range(quantidade):
        resultado = random.randint(1, faces)
        rolagens.append(resultado)
        somaDados += resultado

    totalFinal = somaDados + bonus

    return {
        "formula": f"{quantidade}d{faces}+{bonus}",
        "rolagensIndividuais": rolagens,
        "somaDados": somaDados,
        "bonus": bonus,
        "totalFinal": totalFinal,
        "critico": 20 in rolagens if faces == 20 else False,
        "falhaCritica": 1 in rolagens if faces == 20 else False
    }

@app.route('/')
def home():
    return jsonify({"status": "API do RPG Online!"})

@app.route('/rolar', methods=['POST'])
def rolarApi():
    dados = request.get_json()

    qtd = dados.get('qtd', 1)
    faces = dados.get('faces', 20)
    bonus = dados.get('bonus', 0)

    resultado = rolarDadosLogica(qtd, faces, bonus)

    return jsonify(resultado)

# --- SISTEMA DE USUÁRIOS (AUTH) ---

@app.route('/register', methods=['POST'])
def registrar_usuario():
    dados = request.get_json()
    username = dados.get('username')
    password = dados.get('password')
    is_master = dados.get('is_master', False) # Padrão é False (Player)

    # Validação
    if not username or not password:
        return jsonify({"erro": "Username e Senha são obrigatórios"}), 400
    
    # Verifica se já existe
    if User.query.filter_by(username=username).first():
        return jsonify({"erro": "Usuário já existe"}), 409

    # CRIPTOGRAFIA DA SENHA (HASH)
    senha_segura = generate_password_hash(password)

    novo_user = User(username=username, password=senha_segura, is_master=is_master)
    db.session.add(novo_user)
    db.session.commit()

    return jsonify({"mensagem": "Usuário criado com sucesso!", "id": novo_user.id}), 201

@app.route('/login', methods=['POST'])
def login_usuario():
    dados = request.get_json()
    username = dados.get('username')
    password = dados.get('password')

    # Busca o usuário no banco
    user = User.query.filter_by(username=username).first()

    # Verifica se existe E se a senha bate com o Hash
    if user and check_password_hash(user.password, password):
        # LOGIN SUCESSO!
        # Aqui retornamos se ele é mestre ou não para o Frontend saber o que mostrar
        return jsonify({
            "mensagem": "Login realizado!",
            "user_id": user.id,
            "is_master": user.is_master,
            "username": user.username
        }), 200
    
    return jsonify({"erro": "Credenciais inválidas"}), 401

# --- ROTA DE PERSONAGEM ---

@app.route('/meu-personagem', methods=['POST'])
def get_meu_personagem():
    dados = request.get_json()
    user_id = dados.get('user_id')

    # 1. Busca no banco: Um personagem desse usuário que NÃO esteja morto
    # filter_by(user_id=user_id) -> Pega personagens desse dono
    # filter_by(is_dead=False)   -> Pega apenas os vivos
    personagem = Personagem.query.filter_by(user_id=user_id, is_dead=False).first()

    if personagem:
        # Se achou, retorna os dados da ficha
        return jsonify(personagem.to_dict()), 200
    else:
        # Se não achou (ou se todos morreram), retorna 404
        # O Frontend vai entender esse 404 como: "Ok, libera o botão de Criar Personagem"
        return jsonify({"erro": "Personagem não encontrado"}), 404

@app.route('/criar-personagem', methods=['POST'])
def criar_personagem():
    dados = request.get_json()
    
    # Dados vindos do Frontend
    user_id = dados.get('user_id')
    nome = dados.get('nome')
    historia = dados.get('historia')
    # Por enquanto, vamos forçar todos a serem "Aventureiro" (ID 1)
    # No futuro, o frontend vai mandar o 'classe_id' escolhido
    classe_id = 1 

    # 1. Validação Básica
    if not nome or not user_id:
        return jsonify({"erro": "Nome e User ID são obrigatórios"}), 400

    # 2. Regra de Negócio: Verificar se já tem char vivo (Segurança Dupla)
    if Personagem.query.filter_by(user_id=user_id, is_dead=False).first():
        return jsonify({"erro": "Você já possui um personagem vivo!"}), 403

    # 3. Criação
    novo_char = Personagem(
        nome=nome,
        historia=historia,
        user_id=user_id,
        classe_id=classe_id, # Usando o ID da classe que acabamos de criar
        is_dead=False
    )

    try:
        db.session.add(novo_char)
        db.session.commit()
        return jsonify({"mensagem": "Personagem criado!", "id": novo_char.id}), 201
    except Exception as e:
        return jsonify({"erro": f"Erro ao salvar: {str(e)}"}), 500
    
# --- ROTAS DO SISTEMA DE MAGIA ---

# 1. LISTAR TODAS AS MAGIAS DO JOGO (Para o jogador escolher qual aprender)
@app.route('/magias-disponiveis', methods=['GET'])
def listar_todas_magias():
    magias = Magia.query.all()
    return jsonify([m.to_dict() for m in magias]), 200

# 2. APRENDER UMA MAGIA (Adiciona ao Grimório)
@app.route('/aprender-magia', methods=['POST'])
def aprender_magia():
    data = request.get_json()
    personagem_id = data.get('personagem_id')
    magia_id = data.get('magia_id')

    if not personagem_id or not magia_id:
        return jsonify({"erro": "IDs obrigatórios"}), 400

    # Verifica se já aprendeu essa magia antes
    existe = MagiaAprendida.query.filter_by(personagem_id=personagem_id, magia_id=magia_id).first()
    
    if existe:
        return jsonify({"erro": "Seu personagem já conhece essa magia!"}), 409

    # Adiciona nova magia Nível 1
    novo_aprendizado = MagiaAprendida(personagem_id=personagem_id, magia_id=magia_id, nivel=1)
    
    try:
        db.session.add(novo_aprendizado)
        db.session.commit()
        return jsonify({"mensagem": "Magia aprendida com sucesso!"}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# 3. VER MEU GRIMÓRIO (Lista as magias de um personagem específico)
@app.route('/meu-grimorio/<int:personagem_id>', methods=['GET'])
def ver_grimorio(personagem_id):
    personagem = Personagem.query.get(personagem_id)
    
    if not personagem:
        return jsonify({"erro": "Personagem não encontrado"}), 404
    
    # Usa o relacionamento 'grimorio' que criamos no models.py
    # Retorna uma lista: [{nome: "Fogo", nivel: 1}, {nome: "Cura", nivel: 2}]
    lista_magias = [m.to_dict() for m in personagem.grimorio]
    
    return jsonify(lista_magias), 200

# 4. UPAR MAGIA (Com Regra da Média Aritmética)
@app.route('/habilidades/<int:id_personagem>/<nome_magia>', methods=['PUT'])
def upar_magia_com_media(id_personagem, nome_magia):
    # A. Busca o Personagem
    personagem = Personagem.query.get(id_personagem)
    if not personagem:
        return jsonify({"erro": "Personagem não encontrado"}), 404

    # B. Localiza a Magia Específica e Calcula a Média
    magia_alvo = None
    soma_niveis = 0
    total_magias = 0
    
    # Itera sobre o grimório do banco de dados
    for m in personagem.grimorio:
        soma_niveis += m.nivel
        total_magias += 1
        # Compara o nome da magia (acessando a tabela Magia através de m.info_magia)
        if m.info_magia.nome == nome_magia:
            magia_alvo = m

    if not magia_alvo:
        return jsonify({"erro": "Você não tem essa magia no grimório"}), 404

    # C. Regra do Lobo Solitário
    novo_nivel = magia_alvo.nivel + 1
    
    if total_magias <= 1:
        magia_alvo.nivel = novo_nivel
        db.session.commit()
        return jsonify({"mensagem": f"Level Up (Solo)! '{nome_magia}' foi para o nível {novo_nivel}!"}), 200

    # D. Regra da Média Aritmética
    media_atual = soma_niveis / total_magias
    limitador = media_atual + 1.5 
    
    if novo_nivel > limitador:
        return jsonify({
            "erro": "Desequilíbrio Mágico!",
            "detalhe": f"Sua média é {media_atual:.1f}. Para o Nível {novo_nivel}, suba outras magias."
        }), 400

    # E. Salvar
    magia_alvo.nivel = novo_nivel
    db.session.commit()
    
    return jsonify({
        "mensagem": f"Level Up! '{nome_magia}' atingiu o nível {novo_nivel}!",
        "nova_media": f"{(soma_niveis + 1) / total_magias:.1f}"
    }), 200
    
# --- ÁREA ADMINISTRATIVA ---

@app.route('/users', methods=['GET'])
def listar_usuarios():
    # Na vida real, verificaríamos se quem pediu é admin aqui.
    usuarios = User.query.all()
    return jsonify([u.to_dict() for u in usuarios]), 200

@app.route('/users/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    user = User.query.get(id)
    if not user:
        return jsonify({"erro": "Usuário não encontrado"}), 404
    
    if user.is_admin:
        return jsonify({"erro": "Você não pode deletar o Deus Supremo!"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({"mensagem": "Usuário banido com sucesso!"}), 200

@app.route('/users/<int:id>/role', methods=['PUT'])
def mudar_cargo(id):
    data = request.get_json()
    # Recebe { "is_master": true } ou false
    user = User.query.get(id)
    
    if not user:
        return jsonify({"erro": "Usuário não encontrado"}), 404

    if 'is_master' in data:
        user.is_master = data['is_master']
        db.session.commit()
        return jsonify({"mensagem": f"Cargo de {user.username} atualizado!"}), 200
        
    return jsonify({"erro": "Dados inválidos"}), 400

if __name__ == '__main__':
    app.run(debug=True)