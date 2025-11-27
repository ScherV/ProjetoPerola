from app import app
from database import db
from models import AtributoDef, TalentoDef

def criar_sistema_perola():
    with app.app_context():
        print("📜 Digitalizando a Ficha do Pérola RPG...")

        # 1. CADASTRO DE ATRIBUTOS (Baseados na Imagem)
        atributos_map = {
            "DES": "Destreza",
            "FOR": "Força",
            "VIG": "Vigor",
            "CAR": "Carisma",
            "INT": "Inteligência",
            "PER": "Percepção",
            "EMO": "Emoções",
            "MAN": "Manipulação"
        }

        db_atributos = {} # Dicionário para guardar os objetos do banco

        for sigla, nome in atributos_map.items():
            attr = AtributoDef.query.filter_by(sigla=sigla).first()
            if not attr:
                attr = AtributoDef(nome=nome, sigla=sigla)
                db.session.add(attr)
                print(f" -> Atributo '{nome}' ({sigla}) criado.")
            db_atributos[sigla] = attr # Guarda para usar nos talentos
        
        db.session.commit() # Salva atributos para gerar IDs

        # 2. CADASTRO DE TALENTOS (Baseados na Imagem)
        # Formato: "Nome do Talento": "Sigla do Pai"
        talentos_map = {
            # Destreza
            "Atletismo": "DES", "Armamento": "DES", "Furtividade": "DES",
            # Força
            "Briga": "FOR", "Esquiva": "FOR", "Adrenalina": "FOR",
            # Vigor
            "Resistência": "VIG", "Mira": "VIG", "Ofício": "VIG",
            # Carisma
            "Lábia": "CAR", "Charme": "CAR", "Empatia": "CAR",
            # Inteligência
            "Acadêmicos": "INT", "Medicina": "INT", "Sobrevivência": "INT",
            # Percepção
            "Investigação": "PER", "Prontidão": "PER", "Ocultismo": "PER",
            # Emoções
            "Autocontrole": "EMO", "Coragem": "EMO", "Consciência": "EMO",
            # Manipulação
            "Imponência": "MAN", "Malícia": "MAN", "Performance": "MAN"
        }

        for nome_tal, sigla_pai in talentos_map.items():
            if not TalentoDef.query.filter_by(nome=nome_tal).first():
                pai = AtributoDef.query.filter_by(sigla=sigla_pai).first()
                if pai:
                    novo_tal = TalentoDef(nome=nome_tal, atributo_pai_id=pai.id)
                    db.session.add(novo_tal)
                    print(f" -> Talento '{nome_tal}' vinculado a {pai.nome}.")
        
        db.session.commit()
        print("✅ Sistema de Regras atualizado com sucesso!")

if __name__ == "__main__":
    criar_sistema_perola()