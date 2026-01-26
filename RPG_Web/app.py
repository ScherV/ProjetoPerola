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

# ==============================================================================
# --- FUNÇÕES AUXILIARES E LÓGICA DO SISTEMA ---
# ==============================================================================

def criar_tabelas():
    with app.app_context():
        db.create_all()

def inicializar_ficha_zerada(novo_personagem):
    """Cria a ficha técnica vazia (Atributos/Talentos zerados) para o novo personagem."""
    for attr in AtributoDef.query.all():
        db.session.add(FichaAtributo(personagem=novo_personagem, info=attr, valor=0, rank="-"))
    for tal in TalentoDef.query.all():
        db.session.add(FichaTalento(personagem=novo_personagem, info=tal, valor=0, rank="-"))
    db.session.commit()

LISTA_RANKS = ["-", "F", "E", "D", "C", "B", "A", "S", "Z"]

def calcular_custo_evolucao(valor_atual, rank_letra, tipo="atributo"):
    if valor_atual < 5: return 25
    bonus = 0
    if rank_letra != "-":
        regra = RegraBonusRank.query.filter_by(rank=rank_letra).first()
        if regra:
            bonus = regra.bonus_atributo if tipo == "atributo" else regra.bonus_talento
    multiplicador = 7 if tipo == "atributo" else 5
    return int((valor_atual + bonus) * multiplicador)

def processar_upgrade_pontos(valor_atual, rank_atual, pontos_ganhos):
    """Lógica de ciclo 1-9 e subida de Rank."""
    novo_total = valor_atual + pontos_ganhos
    novo_rank = rank_atual

    while novo_total > 9 and novo_rank != "Z":
        novo_total -= 9
        if novo_rank in LISTA_RANKS:
            idx = LISTA_RANKS.index(novo_rank)
            if idx + 1 < len(LISTA_RANKS):
                novo_rank = LISTA_RANKS[idx + 1]
            else:
                break
    
    if novo_rank == "Z" and novo_total > 999:
        novo_total = 999 

    return novo_total, novo_rank

def calcular_rank_sistema(pontos_brutos):
    """Converte pontos brutos em Rank/Valor (Ex: 9 pts -> Rank F, Valor 1)."""
    if pontos_brutos <= 0: 
        return {"valor": 0, "rank": "-"}
    
    index = (pontos_brutos - 1) // 8
    valor_resetado = ((pontos_brutos - 1) % 8) + 1
    
    # Ranks uteis: F, E, D, C, B, A, S, Z
    ranks_reais = ["F", "E", "D", "C", "B", "A", "S", "Z"]
    
    if index >= len(ranks_reais):
        rank_atual = "Z"
        valor_resetado = 8 
    else:
        rank_atual = ranks_reais[index]

    return {"valor": valor_resetado, "rank": rank_atual}

# --- NOVA LÓGICA DE DADOS (POOL MISTO) ---
def rolar_dados_logica_mista(pool, bonus_total):
    """
    Lógica Híbrida:
    1. D20 Principal -> Usa Tabela do Banco de Dados.
    2. Dados Extras -> Somam valor da face.
    3. Regra de Gêmeos -> Se houver >1 dado do MESMO TIPO no pool extra:
       O '1' não soma, ele se sacrifica para anular o maior valor daquele grupo.
    """
    detalhes = []
    soma_total = 0
    
    # Variáveis de controle do D20 Principal
    tem_d20_principal = False
    critico_principal = False
    falha_principal = False
    soma_dados_brutos = 0 

    # Cria cópia para não alterar o original
    pool_trabalho = [p.copy() for p in pool]
    
    # ---------------------------------------------------------
    # PASSO 1: IDENTIFICAR E ROLAR O D20 PRINCIPAL
    # ---------------------------------------------------------
    for grupo in pool_trabalho:
        if int(grupo['faces']) == 20 and int(grupo['qtd']) > 0:
            tem_d20_principal = True
            
            res = random.randint(1, 20)
            
            # Tabela do Sistema
            regra = RegraDado.query.filter_by(numero_dado=res).first()
            valor_com_regra = regra.modificador if regra else res
            
            soma_total += valor_com_regra
            soma_dados_brutos += valor_com_regra
            
            if res == 20: critico_principal = True
            if res == 1: falha_principal = True
            
            detalhes.append({
                "dado": "D20 Principal",
                "rolagens": [res],
                "valor_somado": valor_com_regra,
                "info": f"Valor Tabela: {valor_com_regra}"
            })
            
            # Remove 1 da contagem (já foi usado como principal)
            grupo['qtd'] = int(grupo['qtd']) - 1
            break 
            
    # ---------------------------------------------------------
    # PASSO 2: ROLAR DADOS ADICIONAIS
    # ---------------------------------------------------------
    for grupo in pool_trabalho:
        qtd = int(grupo['qtd'])
        faces = int(grupo['faces'])
        
        if qtd > 0:
            rolagens = []
            for _ in range(qtd):
                rolagens.append(random.randint(1, faces))
            
            soma_grupo = 0
            info_txt = ""

            # --- REGRA DE DADOS GÊMEOS (> 1 dado do mesmo tipo) ---
            if qtd > 1:
                # Separa os '1's dos outros valores
                uns = rolagens.count(1)
                valores_validos = sorted([x for x in rolagens if x != 1])
                
                # Para cada '1', remove o maior valor disponível
                cancelados = []
                for _ in range(uns):
                    if valores_validos:
                        removido = valores_validos.pop() # Remove o último (maior)
                        cancelados.append(removido)
                
                # O resultado é a soma do que sobrou (os 1s somem na anulação)
                soma_grupo = sum(valores_validos)
                
                if uns > 0:
                    info_txt = f"Gêmeos: {uns}x '1' anulou {cancelados}"
            
            # --- REGRA DE DADO ÚNICO (Soma tudo, inclusive o 1) ---
            else:
                soma_grupo = sum(rolagens)
                # Aqui o 1 vale 1, pois não tem "irmão" para ativar a regra de anulação
            
            soma_total += soma_grupo
            
            detalhes.append({
                "dado": f"D{faces} Extra",
                "rolagens": rolagens, 
                "valor_somado": soma_grupo,
                "info": info_txt
            })

    # Monta a String da Fórmula
    partes_formula = []
    if tem_d20_principal: partes_formula.append("D20(P)")
    for g in pool_trabalho:
        if g['qtd'] > 0: partes_formula.append(f"{g['qtd']}d{g['faces']}")
    if bonus_total != 0: partes_formula.append(f"{bonus_total}")
    
    formula_str = " + ".join(partes_formula)

    return {
        "formula": formula_str,
        "detalhes": detalhes,
        "somaDados": soma_dados_brutos,
        "bonus": bonus_total,
        "totalFinal": soma_total + bonus_total,
        "critico": critico_principal,       
        "falhaCritica": falha_principal,    
        "temD20": tem_d20_principal
    }

    # Fórmula visual
    partes_formula = []
    if tem_d20_principal: partes_formula.append("D20(P)")
    for g in pool_trabalho:
        if g['qtd'] > 0: partes_formula.append(f"{g['qtd']}d{g['faces']}")
    if bonus_total != 0: partes_formula.append(f"{bonus_total}")
    
    formula_str = " + ".join(partes_formula)

    return {
        "formula": formula_str,
        "detalhes": detalhes,
        "somaDados": soma_dados_brutos, # Passa o valor bruto do D20 para o front usar na explosão se precisar
        "bonus": bonus_total,
        "totalFinal": soma_total + bonus_total,
        "critico": critico_principal,       
        "falhaCritica": falha_principal,    
        "temD20": tem_d20_principal
    }

# ==============================================================================
# --- ROTAS DA API ---
# ==============================================================================

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
    
    if not d or 'user_id' not in d or 'nome' not in d:
        return jsonify({'erro': 'Dados incompletos!'}), 400

    if Personagem.query.filter_by(user_id=d.get('user_id'), is_dead=False).first():
        return jsonify({"erro": "Já possui personagem vivo"}), 403

    user_id = d['user_id']
    nome = d['nome']
    terra_natal = d.get('terra_natal', 'Terra Desconhecida') # NOVO CAMPO
    historia = d.get('historia', '')
    
    classe_id_form = d.get('classe_id') 
    tipo_origem = d.get('tipo_origem', 'mandriosa')
    elemento = d.get('elemento') 

    classe_final_id = 1 

    # Lógica de Classe
    if tipo_origem == 'mandriosa' and classe_id_form:
        classe_final_id = classe_id_form
    elif tipo_origem == 'elemental' and elemento:
        preposicao = "da" if elemento in ["Água", "Terra"] else "do"
        elemento_limpo = elemento.split()[0] 
        nome_classe = f"Elemental {preposicao} {elemento_limpo}"
        classe_db = Classe.query.filter_by(nome=nome_classe).first()
        if classe_db:
            classe_final_id = classe_db.id
        else:
            nova_classe = Classe(nome=nome_classe, descricao=f"Entidade elemental de {elemento_limpo}.")
            db.session.add(nova_classe)
            db.session.commit()
            classe_final_id = nova_classe.id
    elif tipo_origem == 'personalizado':
        classe_db = Classe.query.filter_by(nome="Personalizado").first()
        if classe_db:
            classe_final_id = classe_db.id
        else:
            nova = Classe(nome="Personalizado", descricao="Origem única.")
            db.session.add(nova)
            db.session.commit()
            classe_final_id = nova.id

    # Criação
    novo = Personagem(
        nome=nome, 
        historia=historia, 
        terra_natal=terra_natal,
        user_id=user_id, 
        classe_id=classe_final_id
    )
    
    # Grimório Inicial (Mandriosa)
    if tipo_origem == 'mandriosa':
        classe = Classe.query.get(novo.classe_id)
        if classe:
            for m in classe.magias_iniciais:
                novo.grimorio.append(MagiaAprendida(info_magia=m, nivel=1))
    
    try:
        db.session.add(novo)
        db.session.commit()
        inicializar_ficha_zerada(novo)
        return jsonify({"mensagem": "Criado!", "id": novo.id}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# --- GRIMÓRIO E EVOLUÇÃO ---

@app.route('/meu-grimorio/<int:id>', methods=['GET'])
def ver_grimorio(id):
    p = Personagem.query.get(id)
    if not p: return jsonify({"erro": "404"}), 404
    
    lista = []
    for m in p.grimorio:
        dado = m.to_dict()
        dado['is_active'] = getattr(m, 'is_active', True) 
        dado['id_vinculo'] = m.id
        lista.append(dado)
        
    return jsonify(lista)

@app.route('/habilidades/<int:pid>/<nome>', methods=['PUT'])
def upar_magia(pid, nome):
    p = Personagem.query.get(pid)
    if not p: return jsonify({"erro": "Personagem não encontrado"}), 404

    # Verifica se já tem
    magia_aprendida = next((m for m in p.grimorio if m.info_magia.nome == nome), None)

    if magia_aprendida:
        # Evoluir
        if not magia_aprendida.is_active:
            return jsonify({"erro": "Esta habilidade está inativa."}), 400
            
        novo_lvl = magia_aprendida.nivel + 1
        total = len(p.grimorio)
        if total > 1:
            media = sum(m.nivel for m in p.grimorio) / total
            if novo_lvl > (media + 2.0): 
                return jsonify({"erro": "Desequilíbrio! Evolua outras habilidades.", "detalhe": f"Média: {media:.1f}"}), 400

        magia_aprendida.nivel = novo_lvl
        db.session.commit()
        return jsonify({"mensagem": f"Level Up! {nome} subiu para Nível {novo_lvl}."}), 200
    else:
        # Aprender Nova
        magia_db = Magia.query.filter_by(nome=nome).first()
        if not magia_db:
            return jsonify({"erro": f"A habilidade '{nome}' não existe."}), 404
        
        nova_aprendida = MagiaAprendida(info_magia=magia_db, nivel=1, is_active=True)
        p.grimorio.append(nova_aprendida)
        db.session.commit()
        return jsonify({"mensagem": f"Habilidade Aprendida! {nome} adicionada."}), 201

@app.route('/tentar-evoluir', methods=['POST'])
def tentar_evoluir():
    d = request.get_json()
    tipo = d.get('tipo')
    item = FichaAtributo.query.get(d.get('id_vinculo')) if tipo == "atributo" else FichaTalento.query.get(d.get('id_vinculo'))
    
    if not item: return jsonify({"erro": "Item não encontrado"}), 404
    personagem = item.personagem

    custo = calcular_custo_evolucao(item.valor, item.rank, tipo)
    if personagem.xp_livre < custo:
        return jsonify({"erro": "XP Insuficiente", "custo": custo}), 400

    personagem.xp_livre -= custo
    sucessos = 0
    rolagens = []
    aposta = d.get('aposta')
    for _ in range(10):
        res = random.randint(1, 10)
        rolagens.append(res)
        eh_par = (res % 2 == 0)
        if (aposta == "par" and eh_par) or (aposta == "impar" and not eh_par):
            sucessos += 1
    
    rank_antigo = item.rank
    item.valor, item.rank = processar_upgrade_pontos(item.valor, item.rank, sucessos)
    db.session.commit()
    
    return jsonify({
        "mensagem": "Ritual Concluído!",
        "pontosGanhos": sucessos,
        "novoValor": item.valor,
        "novoRank": item.rank,
        "novoSaldo": personagem.xp_livre,
        "dados": rolagens,
        "subiuRank": item.rank != rank_antigo, 
        "custo_pago": custo
    }), 200

# --- GAMEPLAY (DADOS MISTOS E UTILIDADES) ---

@app.route('/rolar', methods=['POST'])
def rolar():
    d = request.get_json()
    
    # Suporte para Pool Misto (Novo) ou Qtd/Faces (Antigo)
    if 'pool' in d:
        return jsonify(rolar_dados_logica_mista(d.get('pool'), d.get('bonus', 0)))
    else:
        # Retrocompatibilidade
        pool_simples = [{"faces": d.get('faces', 20), "qtd": d.get('qtd', 1)}]
        return jsonify(rolar_dados_logica_mista(pool_simples, d.get('bonus', 0)))

@app.route('/salvar-notas', methods=['POST'])
def salvar_notas():
    d = request.get_json()
    p = Personagem.query.filter_by(user_id=d.get('user_id'), is_dead=False).first()
    if not p: return jsonify({"erro": "Personagem sumiu"}), 404
    p.notas = d.get('texto')
    db.session.commit()
    return jsonify({"mensagem": "Salvo!"}), 200

@app.route('/guardar-critico', methods=['POST'])
def guardar_critico():
    d = request.get_json()
    p = Personagem.query.filter_by(user_id=d.get('user_id'), is_dead=False).first()
    if not p: return jsonify({"erro": "404"}), 404
    p.banco_criticos += 1
    db.session.commit()
    return jsonify({"mensagem": "Crítico guardado!", "saldo": p.banco_criticos}), 200

@app.route('/guardar-falha', methods=['POST'])
def guardar_falha():
    d = request.get_json()
    p = Personagem.query.filter_by(user_id=d.get('user_id'), is_dead=False).first()
    if not p: return jsonify({"erro": "404"}), 404
    p.banco_falhas += 1
    db.session.commit()
    return jsonify({"mensagem": "Maldição guardada!", "saldo": p.banco_falhas}), 200

@app.route('/mapas', methods=['GET'])
def listar_todos_mapas():
    return jsonify([m.to_dict() for m in Mapa.query.all()]), 200

@app.route('/desbloquear-mapa', methods=['POST'])
def desbloquear_mapa():
    d = request.get_json()
    p = Personagem.query.get(d.get('personagem_id'))
    m = Mapa.query.get(d.get('mapa_id'))
    if not p or not m: return jsonify({"erro": "Dados inválidos"}), 404
    if m not in p.mapas:
        p.mapas.append(m)
        db.session.commit()
    return jsonify({"mensagem": f"Mapa '{m.nome}' desbloqueado!"}), 200

# ==============================================================================
# --- ROTAS DO MESTRE (CONTROLE TOTAL) ---
# ==============================================================================

@app.route('/mestre/personagens', methods=['GET'])
def listar_todos():
    return jsonify([dict(p.to_dict(), id=p.id) for p in Personagem.query.all()]), 200

@app.route('/mestre/habilidade/status', methods=['PUT'])
def alternar_status_habilidade():
    data = request.json
    magia_aprendida = MagiaAprendida.query.get(data.get('id_vinculo'))
    if not magia_aprendida:
        return jsonify({"erro": "Habilidade não encontrada."}), 404
        
    novo_status = data.get('ativo')
    magia_aprendida.is_active = novo_status
    db.session.commit()
    status_str = "Reativada" if novo_status else "Inativada"
    return jsonify({"mensagem": f"Habilidade {status_str} com sucesso!"}), 200

@app.route('/mestre/habilidade/editar', methods=['PUT'])
def editar_habilidade_mestre():
    data = request.json
    magia_aprendida = MagiaAprendida.query.get(data.get('id_vinculo'))
    if not magia_aprendida:
        return jsonify({"erro": "Habilidade não encontrada."}), 404
        
    if 'nivel' in data:
        magia_aprendida.nivel = int(data['nivel'])
    db.session.commit()
    return jsonify({"mensagem": "Nível alterado pelo Mestre."}), 200

@app.route('/mestre/adicionar-habilidade', methods=['POST'])
def adicionar_habilidade_mestre():
    data = request.json
    
    char_id = data.get('personagem_id')
    nome_input = data.get('nome_habilidade', '').strip()
    nivel_input = int(data.get('nivel', 1))
    
    # Dados para CRIAÇÃO
    tipo_input = data.get('tipo', 'Outro')
    desc_input = data.get('descricao', 'Habilidade concedida pelo Mestre.')
    detalhes_input = data.get('detalhes', '')

    if not nome_input: return jsonify({"erro": "Nome obrigatório."}), 400

    personagem = Personagem.query.get(char_id)
    if not personagem: return jsonify({"erro": "Personagem não encontrado."}), 404

    # Busca ou Cria a Magia
    magia_db = Magia.query.filter(Magia.nome.ilike(nome_input)).first()
    msg_retorno = ""

    if not magia_db:
        # Se não existe, cria!
        magia_db = Magia(
            nome=nome_input,
            tipo=tipo_input,
            descricao=desc_input,
            detalhes=detalhes_input
        )
        db.session.add(magia_db)
        db.session.commit()
        msg_retorno = f"Habilidade '{nome_input}' foi CRIADA e adicionada!"
    else:
        msg_retorno = f"Habilidade '{magia_db.nome}' existente foi vinculada!"

    # Verifica se já tem
    existente = MagiaAprendida.query.filter_by(personagem_id=personagem.id, magia_id=magia_db.id).first()
    if existente:
        if not existente.is_active:
            existente.is_active = True
            db.session.commit()
            return jsonify({"mensagem": f"O personagem já tinha '{nome_input}', ela foi Reativada!"}), 200
        return jsonify({"erro": f"{personagem.nome} já possui esta habilidade ativa."}), 400
        
    # Vincula ao personagem usando a lista (CORRIGIDO)
    nova = MagiaAprendida(info_magia=magia_db, nivel=nivel_input, is_active=True)
    personagem.grimorio.append(nova)
    db.session.commit()
    
    return jsonify({"mensagem": msg_retorno}), 201

# --- GERADOR DE NPC ---
@app.route('/gerar-npc', methods=['POST'])
def gerar_npc():
    data = request.json
    nivel = int(data.get('nivel', 1))
    nome_customizado = data.get('nome', '').strip() or "Inimigo"
    
    classe_selecionada = data.get('classe', 'Aleatorio')
    arquetipo_selecionado = data.get('arquetipo', 'Aleatorio')

    ATRIBUTOS = ["DES", "FOR", "VIG", "CAR", "INT", "PER", "EMO", "MAN"]
    
    TALENTOS_DB = {
        "DES": ["Atletismo", "Armamento", "Furtividade"],
        "FOR": ["Briga", "Esquiva", "Adrenalina"],
        "VIG": ["Resistência", "Mira", "Ofício"],
        "CAR": ["Lábia", "Charme", "Empatia"],
        "INT": ["Acadêmicos", "Medicina", "Sobrevivência"],
        "PER": ["Investigação", "Prontidão", "Ocultismo"],
        "EMO": ["Autocontrole", "Coragem", "Consciência"],
        "MAN": ["Imponência", "Malícia", "Performance"]
    }

    prioridade_talentos = {
        "Ceifeiro": ["Ocultismo", "Imponência", "Briga", "Coragem", "Consciência", "Autocontrole"],
        "Ladino": ["Furtividade", "Malícia", "Lábia", "Armamento", "Esquiva"],
        "Alquimista": ["Medicina", "Ofício", "Acadêmicos", "Investigação", "Sobrevivência"],
        "Aleatorio": [] 
    }

    prioridade_atributos = {
        "Combatente": ["FOR", "VIG", "DES"],
        "Atirador": ["VIG", "DES", "PER"],
        "Ocultista": ["INT", "PER", "EMO"],
        "Social": ["CAR", "MAN", "EMO"],
        "Tanque": ["VIG", "FOR", "EMO"],
        "Aleatorio": [] 
    }

    foco_talentos = prioridade_talentos.get(classe_selecionada, [])
    foco_atributos = prioridade_atributos.get(arquetipo_selecionado, [])

    config_pontos = { 1: 100, 2: 300, 3: 500, 4: 700, 5: 1000 }
    pontos_totais = config_pontos.get(nivel, 100) - 8

    ficha_bruta = { "atributos": {sigla: 1 for sigla in ATRIBUTOS}, "talentos": [] }
    
    lista_talentos = []
    for attr, tals in TALENTOS_DB.items():
        for t in tals:
            lista_talentos.append({"nome": t, "pai": attr, "valor_bruto": 0})

    while pontos_totais > 0:
        tipo = "attr" if random.random() < 0.3 else "tal"

        if tipo == "attr":
            if foco_atributos and random.random() < 0.75:
                escolha = random.choice(foco_atributos)
            else:
                escolha = random.choice(ATRIBUTOS)
            ficha_bruta["atributos"][escolha] += 1
            pontos_totais -= 1
        else: 
            talentos_da_classe = [t for t in lista_talentos if t['nome'] in foco_talentos]
            if talentos_da_classe and random.random() < 0.75:
                talento_alvo = random.choice(talentos_da_classe)
            else:
                talentos_do_arquetipo = [t for t in lista_talentos if t['pai'] in foco_atributos]
                if talentos_do_arquetipo and random.random() < 0.5:
                    talento_alvo = random.choice(talentos_do_arquetipo)
                else:
                    talento_alvo = random.choice(lista_talentos)
            talento_alvo["valor_bruto"] += 1
            pontos_totais -= 1

    ficha_final = { "atributos": {}, "talentos": [] }

    for sigla, pontos in ficha_bruta["atributos"].items():
        ficha_final["atributos"][sigla] = calcular_rank_sistema(pontos)

    for t in lista_talentos:
        if t["valor_bruto"] > 0:
            dados_rank = calcular_rank_sistema(t["valor_bruto"])
            ficha_final["talentos"].append({
                "nome": t["nome"], "pai": t["pai"],
                "valor": dados_rank["valor"], "rank": dados_rank["rank"]
            })
            
    rank_order = {r: i for i, r in enumerate(["F", "E", "D", "C", "B", "A", "S", "Z"])}
    ficha_final["talentos"].sort(key=lambda x: (rank_order.get(x['rank'], -1), x['valor']), reverse=True)

    return jsonify({
        "nome": nome_customizado, 
        "classe": classe_selecionada,     
        "arquetipo": arquetipo_selecionado, 
        "nivel": nivel,
        "pontos_gastos": config_pontos.get(nivel, 100),
        "ficha": ficha_final
    })

if __name__ == '__main__':
    criar_tabelas()
    app.run(debug=True)