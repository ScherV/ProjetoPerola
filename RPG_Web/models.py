from database import db

class Classe(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome= db.Column(db.String(80), unique=True, nullable=False)
    descricao = db.Column(db.String(250))

    personagens = db.relationship('Personagem', backref='classe_rpg', lazy=True)

    def to_dict(self):
        return {"id": self.id, "nome": self.nome, "descricao": self.descricao}
    
class Personagem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    nomeJogador = db.Column(db.String(100))
    historia = db.Column(db.Text)

    classeId = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), unique=True, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "jogador": self.nomeJogador,
            "historia": self.historia,
            "classe": self.classe_rpg.nome
        }
    
class Atributo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), unique=True, nullable=False)

    def to_dict(self):
        return {"id": self.id, "nome": self.nome}