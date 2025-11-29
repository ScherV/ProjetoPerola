import os
import time

# Lista de comandos na ordem exata
comandos = [
    "rm rpg_database.db", # Apaga o banco (Linux/Mac). Se for Windows, o python tenta tratar abaixo.
    "python app.py",      # Cria tabelas (Vai rodar e parar, ou precisamos ajustar o app.py para só criar se chamado)
    # O ideal é que o app.py tenha uma função que só cria tabelas sem rodar o servidor.
    # Mas vamos usar os seeds diretos.
]

print("🚨 INICIANDO RESET DO SISTEMA 🚨")

# 1. Apagar Banco Antigo
if os.path.exists("rpg_database.db"):
    os.remove("rpg_database.db")
    print("🗑️  Banco de dados antigo apagado.")

if os.path.exists("instance/rpg_database.db"):
    os.remove("instance/rpg_database.db")
    print("🗑️  Banco de dados (instance) apagado.")

# 2. Criar Tabelas (Chamando o app rapidamente ou usando um script específico)
# O jeito mais seguro é rodar um script que importa o db e dá create_all
print("🏗️  Criando tabelas...")
os.system("python -c \"from app import app, db; app.app_context().push(); db.create_all()\"")

# 3. Rodar os Seeds
print("🌱 Semeando o mundo...")
os.system("python seed_sistema.py") # Atributos e Talentos
os.system("python seed_rules.py")   # Regras de Dados/Rank
# os.system("python seed_magias.py") <-- Se quiser manter magias genéricas
os.system("python seed_classes.py") # Classes (Ceifeiro, Ladino)
os.system("python seed_admin.py")   # Usuários

print("\n✨ TUDO PRONTO! Pode rodar 'python app.py' agora.")