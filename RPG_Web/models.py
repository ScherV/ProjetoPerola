from database import db

# --- TABELA AUXILIAR (Muitos-para-Muitos: Classes <-> Magias) ---
classe_magias = db.Table('classe_magias',
    db.Column('classe_id', db.Integer, db.ForeignKey('classe.id'), primary_key=True),
    db.Column('magia_id', db.Integer, db.ForeignKey('magia.id'), primary_key=True)
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
        return {
            "id": self.id,
            "username": self.username,
            "is_master": self.is_master,
            "is_admin": self.is_admin
        }

# --- 2. TABELA DE CLASSES ---
class Classe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    descricao = db.Column(db.String(250))
    
    # Relacionamento: Magias que a classe ganha ao nascer
    magias_iniciais = db.relationship('Magia', secondary=classe_magias, backref='classes_que_tem')

    def to_dict(self):
        return {"id": self.id, "nome": self.nome, "descricao": self.descricao}

# --- 3. TABELA DE PERSONAGENS ---
class Personagem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    historia = db.Column(db.Text)
    is_dead = db.Column(db.Boolean, default=False)
    
    # Chaves Estrangeiras
    classe_id = db.Column(db.Integer, db.ForeignKey('classe.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # RELACIONAMENTOS
    # 1. Link com a Classe (Correção do erro)
    classe_info = db.relationship('Classe', backref='personagens_desta_classe')
    
    # 2. Link com o Grimório (Magias Aprendidas)
    grimorio = db.relationship('MagiaAprendida', backref='dono_magia', lazy=True, cascade="all, delete-orphan")
    
    # 3. Link com Atributos (Pontos)
    pontos = db.relationship('PontosAtributo', backref='dono_pontos', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            # AQUI ESTÁ A CORREÇÃO: Usamos self.classe_info
            "classe": self.classe_info.nome if self.classe_info else "Classe Desconhecida",
            "dono": self.dono.username if self.dono else "Desconhecido",
            "is_dead": self.is_dead,
            "historia": self.historia,
            # Retorna os atributos também
            "atributos": [p.to_dict() for p in self.pontos]
        }

# --- 4. TABELAS DE MAGIA ---
class Magia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    descricao = db.Column(db.String(200))
    tipo = db.Column(db.String(50))
    
    def to_dict(self):
        return {"id": self.id, "nome": self.nome, "descricao": self.descricao, "tipo": self.tipo}

class MagiaAprendida(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nivel = db.Column(db.Integer, default=1)

    ativa = db.Column(db.Boolean, default=True)
    
    personagem_id = db.Column(db.Integer, db.ForeignKey('personagem.id'), nullable=False)
    magia_id = db.Column(db.Integer, db.ForeignKey('magia.id'), nullable=False)
    
    info_magia = db.relationship('Magia')

    def to_dict(self):
        return {
            "id_vinculo": self.id,
            "nome": self.info_magia.nome,
            "descricao": self.info_magia.descricao,
            "nivel": self.nivel,
            "tipo": self.info_magia.tipo,
            "ativa": self.ativa
        }

# --- 5. TABELAS DE ATRIBUTOS ---
class Atributo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), unique=True, nullable=False)
    
    def to_dict(self):
        return {"id": self.id, "nome": self.nome}

class PontosAtributo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    valor = db.Column(db.Integer, default=0)
    
    personagem_id = db.Column(db.Integer, db.ForeignKey('personagem.id'), nullable=False)
    atributo_id = db.Column(db.Integer, db.ForeignKey('atributo.id'), nullable=False)
    
    atributo_info = db.relationship('Atributo')

    def to_dict(self):
        return {
            "nome_atributo": self.atributo_info.nome,
            "valor": self.valor
        }