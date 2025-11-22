from app import app
from database import db
from models import Classe

def criar_classe_teste():
    with app.app_context():
        print("🌱 Verificando classes...")
        
        # Verifica se a classe já existe para não dar erro de duplicidade
        if not Classe.query.filter_by(nome="Aventureiro").first():
            nova_classe = Classe(nome="Aventureiro", descricao="Classe padrão para testes do sistema.")
            db.session.add(nova_classe)
            db.session.commit()
            print("✅ Classe 'Aventureiro' (ID: 1) criada com sucesso!")
        else:
            print("ℹ️ A classe 'Aventureiro' já existe. Tudo pronto.")

if __name__ == "__main__":
    criar_classe_teste()