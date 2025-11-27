from app import app
from database import db
from models import Mapa, Personagem

def criar_mapas():
    with app.app_context():
        print("🗺️ Cartografando o mundo...")

        lista_mapas = [
            {
                "nome": "Mundo Conhecido",
                "desc": "O mapa geral do continente e seus arredores.",
                "url": "/maps/mundo.jpg"
            },
            {
                "nome": "Região de Mandriosa",
                "desc": "A área protegida pela Cúpula, contendo florestas e vilas.",
                "url": "/maps/mandriosa.jpg"
            },
            {
                "nome": "Vila da Fossa",
                "desc": "Um local perigoso ao sudoeste de Mandriosa.",
                "url": "/maps/fossa.jpg"
            }
        ]

        for m in lista_mapas:
            if not Mapa.query.filter_by(nome=m["nome"]).first():
                novo_mapa = Mapa(nome=m["nome"], descricao=m["desc"], arquivo_url=m["url"])
                db.session.add(novo_mapa)
                print(f" -> Mapa '{m['nome']}' criado.")

        db.session.commit()
        
        # EXTRA: Dar o Mapa Mundi para TODOS os personagens existentes (presente do GM)
        mapa_mundo = Mapa.query.filter_by(nome="Mundo Conhecido").first()
        personagens = Personagem.query.all()
        
        for p in personagens:
            if mapa_mundo not in p.mapas:
                p.mapas.append(mapa_mundo)
                print(f" -> {p.nome} recebeu o Mapa Mundi.")
        
        db.session.commit()
        print("✅ Cartografia concluída!")

if __name__ == "__main__":
    criar_mapas()