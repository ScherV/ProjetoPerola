from database import db

# --- TABELA AUXILIAR (Classes <-> Magias) ---
classe_magias = db.Table('classe_magias',
    db.Column('classe_id', db.Integer, db.ForeignKey('classe.id'), primary_key=True),
    db.Column('magia_id', db.Integer, db.ForeignKey('magia.id'), primary_key=True)
)

# Tabela auxiliar para Mapas Desbloqueados
personagem_mapas = db.Table('personagem_mapas',
    db.Column('personagem_id', db.Integer, db.ForeignKey('personagem.id'), primary_key=True),
    db.Column('mapa_id', db.Integer, db.ForeignKey('mapa.id'), primary_key=True)
)

# --- 1. TABELA DE USUÁRIOS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_master = db.Column(db.Boolean, default=False)
    is_admin = db.Column(db.Boolean, default=False)
    personagens = db.relationship('Personagem', backref='dono', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "username": self.username, "is_master": self.is_master, "is_admin": self.is_admin}

# --- 2. TABELA DE CLASSES ---
class Classe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    descricao = db.Column(db.String(250))
    magias_iniciais = db.relationship('Magia', secondary=classe_magias, backref='classes_que_tem')

    def to_dict(self):
        return {"id": self.id, "nome": self.nome, "descricao": self.descricao}

# --- 3. TABELA DE PERSONAGENS ---
class Personagem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    historia = db.Column(db.Text)
    is_dead = db.Column(db.Boolean, default=False)
    
    # Banco de Dados de Críticos e Falhas
    banco_criticos = db.Column(db.Integer, default=0)
    banco_falhas = db.Column(db.Integer, default=0)

    classe_id = db.Column(db.Integer, db.ForeignKey('classe.id'), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    classe_info = db.relationship('Classe', backref='personagens_desta_classe')
    grimorio = db.relationship('MagiaAprendida', backref='dono_magia', lazy=True, cascade="all, delete-orphan")
    
    # Relacionamentos com a ficha técnica
    atributos = db.relationship('FichaAtributo', backref='personagem', lazy=True, cascade="all, delete-orphan")
    talentos = db.relationship('FichaTalento', backref='personagem', lazy=True, cascade="all, delete-orphan")

    pontos_atributos_livres = db.Column(db.Integer, default=10) # Ex: Começa com 10 pra distribuir
    pontos_talentos_livres = db.Column(db.Integer, default=15)  # Ex: Começa com 15 pra distribuir

    xp_livre = db.Column(db.Integer, default=2000)  # Experiência livre para gastar

    mapas = db.relationship('Mapa', secondary=personagem_mapas, backref='exploradores', lazy=True)

    notas = db.Column(db.Text, default="")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "classe": self.classe_info.nome if self.classe_info else "Classe Desconhecida",
            "dono": self.dono.username if self.dono else "Desconhecido",
            "is_dead": self.is_dead,
            "historia": self.historia,
            "banco_criticos": self.banco_criticos,
            "banco_falhas": self.banco_falhas,
            "pontos_atributos_livres": self.pontos_atributos_livres,
            "pontos_talentos_livres": self.pontos_talentos_livres,
            "atributos": [a.to_dict() for a in self.atributos],
            "talentos": [t.to_dict() for t in self.talentos],
            "xp_livre": self.xp_livre,
            "mapas": [m.to_dict() for m in self.mapas],
            "notas": self.notas
        }

# --- 4. TABELAS DE MAGIA ---
class Magia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    descricao = db.Column(db.String(200)) # Descrição curta (para o card)
    detalhes = db.Column(db.Text) # <--- NOVO: Descrição longa e observações
    tipo = db.Column(db.String(50))
    
    def to_dict(self):
        return {
            "id": self.id, 
            "nome": self.nome, 
            "descricao": self.descricao, 
            "detalhes": self.detalhes, # <--- Retornar isso também
            "tipo": self.tipo
        }

class MagiaAprendida(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    personagem_id = db.Column(db.Integer, db.ForeignKey('personagem.id'))
    magia_id = db.Column(db.Integer, db.ForeignKey('magia.id'))
    nivel = db.Column(db.Integer, default=1)
    
    is_active = db.Column(db.Boolean, default=True) # True = Ativa, False = Inativa/Perdida

    info_magia = db.relationship('Magia')

    def to_dict(self):
        return {
            "id_vinculo": self.id,
            "nome": self.info_magia.nome,
            "descricao": self.info_magia.descricao,
            "detalhes": self.info_magia.detalhes, 
            "nivel": self.nivel,
            "tipo": self.info_magia.tipo,
            "is_active": self.is_active
        }

# --- 5. DEFINIÇÕES DO SISTEMA (Regras Novas) ---

class AtributoDef(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), unique=True)
    sigla = db.Column(db.String(3))

class TalentoDef(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), unique=True)
    atributo_pai_id = db.Column(db.Integer, db.ForeignKey('atributo_def.id'))
    atributo_pai = db.relationship('AtributoDef')

# --- 6. A FICHA TÉCNICA DO PERSONAGEM (Valores Reais) ---

class FichaAtributo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    valor = db.Column(db.Integer, default=0)
    rank = db.Column(db.String(1), default="-")
    
    personagem_id = db.Column(db.Integer, db.ForeignKey('personagem.id'))
    atributo_def_id = db.Column(db.Integer, db.ForeignKey('atributo_def.id'))
    
    info = db.relationship('AtributoDef')

    def to_dict(self):
        return {
            "id_vinculo": self.id, # Importante para o clique do botão
            "nome": self.info.nome,
            "sigla": self.info.sigla,
            "valor": self.valor,
            "rank": self.rank
        }

class FichaTalento(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    valor = db.Column(db.Integer, default=0)
    rank = db.Column(db.String(1), default="-")
    
    personagem_id = db.Column(db.Integer, db.ForeignKey('personagem.id'))
    talento_def_id = db.Column(db.Integer, db.ForeignKey('talento_def.id'))
    
    info = db.relationship('TalentoDef')

    def to_dict(self):

        atributo_pai_ficha = FichaAtributo.query.filter_by(
            personagem_id=self.personagem_id, 
            atributo_def_id=self.info.atributo_pai_id
        ).first()

        valor_atributo = atributo_pai_ficha.valor if atributo_pai_ficha else 0
        rank_atributo = atributo_pai_ficha.rank if atributo_pai_ficha else "-"

        return {
            "id_vinculo": self.id,
            "nome": self.info.nome,
            "valor": self.valor,
            "rank": self.rank,
            "atributo_base": self.info.atributo_pai.sigla if self.info.atributo_pai else "-",
            "valor_atributo_pai": valor_atributo,
            "rank_atributo_pai": rank_atributo
        }

# --- 7. TABELAS DE CÁLCULO (Tabelinhas da Imagem) ---

class RegraBonusRank(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rank = db.Column(db.String(1))
    bonus_atributo = db.Column(db.Integer)
    bonus_talento = db.Column(db.Integer)

class RegraDado(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    numero_dado = db.Column(db.Integer)
    modificador = db.Column(db.Integer)
    eh_falha = db.Column(db.Boolean, default=False)

class Mapa(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(500))
    imagem_url = db.Column(db.String(500)) # <--- ESSENCIAL
    is_public = db.Column(db.Boolean, default=True)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "imagem_url": self.imagem_url, # <--- ESSENCIAL
            "is_public": self.is_public
        }