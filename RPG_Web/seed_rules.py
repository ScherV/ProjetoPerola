from app import app
from database import db
from models import RegraBonusRank, RegraDado, AtributoDef, TalentoDef

def criar_regras():
    with app.app_context():
        print("📜 Escrevendo as Leis do Universo Pérola...")

        # 1. Tabela de Ranks (Conforme imagem)
        ranks = [
            {"r": "F", "attr": 2, "tal": 3},
            {"r": "E", "attr": 4, "tal": 6},
            {"r": "D", "attr": 6, "tal": 9},
            {"r": "C", "attr": 8, "tal": 12},
            {"r": "B", "attr": 10, "tal": 15},
            {"r": "A", "attr": 12, "tal": 18},
            {"r": "S", "attr": 15, "tal": 21},
            {"r": "Z", "attr": 20, "tal": 25},
        ]
        
        for r in ranks:
            if not RegraBonusRank.query.filter_by(rank=r["r"]).first():
                db.session.add(RegraBonusRank(rank=r["r"], bonus_atributo=r["attr"], bonus_talento=r["tal"]))

        # 2. Tabela de Dados (Conforme imagem)
        # Nota: 01 é Falha (-F), vou colocar um valor negativo gigante simbólico ou tratar no código
        dados = [
            { "d": 1, "mod": -999, "fail": True }, # Falha Crítica
            { "d": 2, "mod": -70 }, { "d": 3, "mod": -50 },
            { "d": 4, "mod": -40 }, { "d": 5, "mod": -33 },
            { "d": 6, "mod": -21 }, { "d": 7, "mod": -21 }, # Imagem parece repetir ou pulei algo? Ajuste se precisar
            { "d": 8, "mod": -15 }, { "d": 9, "mod": -9 },
            { "d": 10, "mod": -3 }, { "d": 11, "mod": 1 },
            { "d": 12, "mod": 2 },  { "d": 13, "mod": 3 },
            { "d": 14, "mod": 4 },  { "d": 15, "mod": 5 },
            { "d": 16, "mod": 6 },  { "d": 17, "mod": 7 },
            { "d": 18, "mod": 8 },  { "d": 19, "mod": 9 },
            { "d": 20, "mod": 10 }
        ]
        
        for d in dados:
            if not RegraDado.query.filter_by(numero_dado=d["d"]).first():
                db.session.add(RegraDado(
                    numero_dado=d["d"], 
                    modificador=d.get("mod"), 
                    eh_falha=d.get("fail", False)
                ))

        # 3. Criar Atributos Base (Siglas da imagem)
        atributos = [
            {"n": "Destreza", "s": "DES"}, {"n": "Inteligência", "s": "INT"},
            {"n": "Força", "s": "FOR"},    {"n": "Percepção", "s": "PER"},
            {"n": "Vigor", "s": "VIG"},    {"n": "Emoções", "s": "EMO"},
            {"n": "Carisma", "s": "CAR"},  {"n": "Manipulação", "s": "MAN"}
        ]
        
        for a in atributos:
            if not AtributoDef.query.filter_by(sigla=a["s"]).first():
                db.session.add(AtributoDef(nome=a["n"], sigla=a["s"]))
        
        db.session.commit()
        print("✅ Regras, Atributos e Tabelas inseridos!")

if __name__ == "__main__":
    criar_regras()