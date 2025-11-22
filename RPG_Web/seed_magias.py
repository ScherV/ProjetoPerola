from app import app
from database import db
from models import Magia

def criar_magias():
    with app.app_context():
        print("✨ Criando Magias...")
        
        lista_magias = [
            Magia(nome="Bola de Fogo", descricao="Lança uma esfera flamejante.", tipo="Ataque"),
            Magia(nome="Cura Menor", descricao="Recupera ferimentos leves.", tipo="Cura"),
            Magia(nome="Escudo Arcano", descricao="Aumenta a defesa temporariamente.", tipo="Defesa"),
            Magia(nome="Raio Sombrio", descricao="Disparo de energia necromântica.", tipo="Ataque"),
            Magia(nome="Invisibilidade", descricao="Torna o alvo translúcido.", tipo="Utilidade"),
            Magia(nome="Detectar Magia", descricao="Sente auras mágicas próximas.", tipo="Utilidade")
        ]

        for m in lista_magias:
            # Só adiciona se não existir
            if not Magia.query.filter_by(nome=m.nome).first():
                db.session.add(m)
        
        db.session.commit()
        print("📚 Grimório Global atualizado!")

if __name__ == "__main__":
    criar_magias()