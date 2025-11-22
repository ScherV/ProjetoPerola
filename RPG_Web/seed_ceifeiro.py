from app import app
from database import db
from models import Classe, Magia

def criar_kit_ceifeiro():
    with app.app_context():
        print("💀 Reformulando a Ordem dos Ceifeiros...")

        # 1. Garante que a Classe existe
        ceifeiro = Classe.query.filter_by(nome="Ceifeiro").first()
        if not ceifeiro:
            ceifeiro = Classe(nome="Ceifeiro", descricao="Guardião do equilíbrio entre vida e morte.")
            db.session.add(ceifeiro)
            db.session.commit() # Salva a classe para garantir que ela tenha ID
            print(" -> Classe Ceifeiro criada/encontrada.")

        # 2. Lista Oficial de Habilidades (Baseada na sua imagem)
        # DICA: Edite os campos "desc" e "tipo" conforme a lore do seu jogo!
        novas_habilidades = [
            {"nome": "Translúcido", "tipo": "Defesa", "desc": "Torna-se intangível por breves momentos."},
            {"nome": "Alma", "tipo": "Passiva", "desc": "Permite interagir com a essência dos seres."},
            {"nome": "Absorção", "tipo": "Suporte", "desc": "Drena energia espiritual para recuperar forças."},
            {"nome": "Invocação dos Mortos", "tipo": "Invocação", "desc": "Ergue servos mortos-vivos para lutar."},
            {"nome": "Ancestral da Morte", "tipo": "Buff", "desc": "Canaliza o poder dos antigos ceifeiros."},
            {"nome": "Tato Espiritual", "tipo": "Passiva", "desc": "Sente presenças espirituais próximas."},
            {"nome": "Mímica", "tipo": "Utilidade", "desc": "Copia comportamentos ou aparências."},
            {"nome": "Pensamento", "tipo": "Mental", "desc": "Habilidade psíquica de leitura ou proteção."},
            {"nome": "Foice Espiritual", "tipo": "Ataque", "desc": "Materializa a arma clássica do ceifeiro."}
        ]

        # 3. Limpa as magias antigas do Ceifeiro (Opcional: Remove vínculos anteriores)
        ceifeiro.magias_iniciais.clear()
        print(" -> Kit anterior limpo.")

        # 4. Cria e Vincula as Novas
        for dados in novas_habilidades:
            # Verifica se a magia já existe no banco geral
            magia = Magia.query.filter_by(nome=dados["nome"]).first()
            
            if not magia:
                # Se não existe, cria
                magia = Magia(nome=dados["nome"], tipo=dados["tipo"], descricao=dados["desc"])
                db.session.add(magia)
                print(f" -> Nova Magia criada: {dados['nome']}")
            
            # Vincula à classe Ceifeiro
            ceifeiro.magias_iniciais.append(magia)

        db.session.commit()
        print("✅ Novo Kit do Ceifeiro atualizado com sucesso!")

if __name__ == "__main__":
    criar_kit_ceifeiro()