from app import app
from database import db
from models import Mapa

def seed_mapas():
    with app.app_context():
        db.session.query(Mapa).delete() # Limpa antigos
        
        mapas = [
            Mapa(
                nome="O Mundo Conhecido",
                descricao="Mapa global.",
                imagem_url="/mapas/mundo.jpg", # Nome exato do arquivo
                is_public=True
            ),
            Mapa(
                nome="Região de Mandriosa",
                descricao="Pântanos.",
                imagem_url="/mapas/mandriosa.jpg",
                is_public=True
            ),
            Mapa(
                nome="Continente da Fossa",
                descricao="Terras novas.",
                imagem_url="/mapas/fossa.jpg",
                is_public=True
            )
        ]
        db.session.add_all(mapas)
        db.session.commit()
        print("✅ Mapas criados com sucesso!")

if __name__ == '__main__':
    seed_mapas()