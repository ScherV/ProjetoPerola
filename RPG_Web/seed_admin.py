from app import app
from database import db
from models import User
from werkzeug.security import generate_password_hash

def criar_admin():
    print("🚀 Iniciando criação do Admin...") # Debug
    
    with app.app_context():
        # Verifica se já existe
        if User.query.filter_by(username="admin").first():
            print("ℹ️ O usuário 'admin' já existe no banco.")
            return

        print("⚙️ Gerando senha segura...")
        senha_hash = generate_password_hash("admin123") 
        
        # Cria o usuário com PODERES TOTAIS
        admin = User(username="admin", password=senha_hash, is_master=True, is_admin=True)
        
        db.session.add(admin)
        db.session.commit()
        print("👑 SUCESSO: Usuário ADMIN criado! (Login: admin / Senha: admin123)")

# O GATILHO DE EXECUÇÃO:
if __name__ == "__main__":
    criar_admin()