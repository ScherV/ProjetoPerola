from app import app
from database import db
from models import Mapa, Personagem

def semear_mapas():
    with app.app_context():
        print("🗺️ Desenhando os Mapas do Mundo...")

        # Lista exata das suas imagens
        mapas = [
            {
                "nome": "O Mundo Conhecido",
                "url": "/maps/mundo.jpg" # Caminho na pasta public
            },
            {
                "nome": "Região de Mandriosa",
                "url": "/maps/mandriosa.jpg"
            },
            {
                "nome": "Continente da Fossa",
                "url": "/maps/fossa.jpg"
            }
        ]

        for m in mapas:
            mapa_db = Mapa.query.filter_by(nome=m["nome"]).first()
            if not mapa_db:
                novo = Mapa(nome=m["nome"], arquivo_url=m["url"])
                db.session.add(novo)
                print(f" -> Mapa '{m['nome']}' catalogado.")
            else:
                # Atualiza caso você mude a descrição ou url
                mapa_db.arquivo_url = m["url"]
        
        db.session.commit()
        
        # EXTRA: Dar o Mapa Mundi para TODOS os personagens (Presente do Mestre)
        mapa_inicial = Mapa.query.filter_by(nome="O Mundo Conhecido").first()
        if mapa_inicial:
            for p in Personagem.query.all():
                if mapa_inicial not in p.mapas:
                    p.mapas.append(mapa_inicial)
            db.session.commit()
            print("🎁 Mapa Mundi entregue a todos os viajantes!")

if __name__ == "__main__":
    semear_mapas()