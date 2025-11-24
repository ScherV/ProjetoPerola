from app import app
from database import db
from models import TalentoDef, AtributoDef

def semear_talentos():
    with app.app_context():
        print("🌱 Cultivando Talentos...")

        # Dicionário baseada na sua Ficha (Talento -> Sigla do Atributo Pai)
        # Isso facilita buscar o ID correto no banco
        lista_talentos = [
            # DES (Destreza)
            {"nome": "Atletismo", "pai": "DES"},
            {"nome": "Armamento", "pai": "DES"},
            {"nome": "Furtividade", "pai": "DES"},
            
            # FOR (Força)
            {"nome": "Briga", "pai": "FOR"},
            {"nome": "Esquiva", "pai": "FOR"},
            {"nome": "Adrenalina", "pai": "FOR"},

            # INT (Inteligência)
            {"nome": "Acadêmicos", "pai": "INT"},
            {"nome": "Medicina", "pai": "INT"},
            {"nome": "Sobrevivência", "pai": "INT"},

            # PER (Percepção)
            {"nome": "Investigação", "pai": "PER"},
            {"nome": "Prontidão", "pai": "PER"},
            {"nome": "Ocultismo", "pai": "PER"},

            # VIG (Vigor)
            {"nome": "Resistência", "pai": "VIG"},
            {"nome": "Mira", "pai": "VIG"},
            {"nome": "Ofício", "pai": "VIG"},

            # EMO (Emoções)
            {"nome": "Autocontrole", "pai": "EMO"},
            {"nome": "Coragem", "pai": "EMO"},
            {"nome": "Consciência", "pai": "EMO"},

            # MAN (Manipulação)
            {"nome": "Imponência", "pai": "MAN"},
            {"nome": "Malícia", "pai": "MAN"},
            {"nome": "Performance", "pai": "MAN"},

            # CAR (Carisma)
            {"nome": "Lábia", "pai": "CAR"},
            {"nome": "Charme", "pai": "CAR"},
            {"nome": "Empatia", "pai": "CAR"},
        ]

        for item in lista_talentos:
            # 1. Verifica se o talento já existe
            if not TalentoDef.query.filter_by(nome=item["nome"]).first():
                
                # 2. Busca o Atributo Pai pelo nome da Sigla (ex: "DES")
                atributo_pai = AtributoDef.query.filter_by(sigla=item["pai"]).first()
                
                if atributo_pai:
                    novo_talento = TalentoDef(
                        nome=item["nome"],
                        atributo_pai_id=atributo_pai.id
                    )
                    db.session.add(novo_talento)
                    print(f" -> Talento '{item['nome']}' vinculado a {item['pai']}.")
                else:
                    print(f"❌ ERRO: Atributo '{item['pai']}' não encontrado para '{item['nome']}'. Rode o seed_rules primeiro!")

        db.session.commit()
        print("✅ Lista de Talentos concluída!")

if __name__ == "__main__":
    semear_talentos()