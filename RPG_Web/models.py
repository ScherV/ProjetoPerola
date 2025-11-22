from database import db

# --- 1. TABELA DE USUÁRIOS (Login) ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    is_master = db.Column(db.Boolean, default=False)
    
    # NOVO CAMPO: O Admin Supremo
    is_admin = db.Column(db.Boolean, default=False) 
    
    # CORREÇÃO IMPORTANTE: cascade="all, delete-orphan"
    # Se apagar o User, apaga o Personagem automaticamente.
    personagens = db.relationship('Personagem', backref='dono', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "is_master": self.is_master,
            "is_admin": self.is_admin # Retorna essa info pro site
        }

# --- 2. TABELA DE CLASSES (Mantida) ---
class Classe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    descricao = db.Column(db.String(250))
    personagens = db.relationship('Personagem', backref='classe_rpg', lazy=True)

    def to_dict(self):
        return {"id": self.id, "nome": self.nome, "descricao": self.descricao}

# --- 3. TABELA DE PERSONAGENS (Atualizada) ---
class Personagem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    historia = db.Column(db.Text)
    grimorio = db.relationship('MagiaAprendida', backref='dono_magia', lazy=True, cascade="all, delete-orphan")
    
    # NOVO CAMPO: Status (Padrão é 'vivo')
    is_dead = db.Column(db.Boolean, default=False) 
    
    # Links (Chaves Estrangeiras)
    classe_id = db.Column(db.Integer, db.ForeignKey('classe.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False) # Link com o dono

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "classe": self.classe_rpg.nome if self.classe_rpg else "Classe Desconhecida",
            "dono": self.dono.username,
            "is_dead": self.is_dead,
            "historia": self.historia
        }

# --- TABELA DE ATRIBUTOS (Mantida) ---
class Atributo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), unique=True, nullable=False)

# ... (Classes User, Classe, Personagem, Atributo, PontosAtributo acima)

# 5. TABELA DE DEFINIÇÃO DE MAGIAS (O Livro de Regras)
class Magia(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(80), unique=True, nullable=False)
    descricao = db.Column(db.String(200))
    tipo = db.Column(db.String(50)) # Ex: "Ataque", "Cura", "Buff"
    
    def to_dict(self):
        return {"id": self.id, "nome": self.nome, "descricao": self.descricao, "tipo": self.tipo}

# 6. TABELA DE MAGIAS APRENDIDAS (O Grimório do Deimos)
# Liga o Personagem à Magia e guarda o NÍVEL dela
class MagiaAprendida(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nivel = db.Column(db.Integer, default=1) # Começa nível 1
    
    personagem_id = db.Column(db.Integer, db.ForeignKey('personagem.id'), nullable=False)
    magia_id = db.Column(db.Integer, db.ForeignKey('magia.id'), nullable=False)
    
    # Relacionamentos
    info_magia = db.relationship('Magia') # Para acessar o nome da magia

    def to_dict(self):
        return {
            "id_vinculo": self.id, # ID único desse aprendizado
            "nome": self.info_magia.nome,
            "descricao": self.info_magia.descricao,
            "nivel": self.nivel,
            "tipo": self.info_magia.tipo
        }