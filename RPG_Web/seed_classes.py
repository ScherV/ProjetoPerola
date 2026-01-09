from app import app
from database import db
from models import Classe, Magia

def semear_classes():
    with app.app_context():
        print("⚔️ Forjando as Classes e Habilidades...")

        # --- LISTA MESTRA DE CLASSES ---
        dados_classes = [
            # =========================================
            # CLASSE 1: CEIFEIRO
            # =========================================
            {
                "nome": "Ceifeiro",
                "descricao": "Mestres do limiar etéreo, os Ceifeiros não causam apenas feridas físicas, mas rompem a própria essência espiritual. Capazes de transitar intocáveis entre os planos e comandar as forças do pós-vida.",
                "kit": [
                    { "nome": "Translúcido", "tipo": "Defesa", "desc": "Permite ser intocável para tudo que for material.", "detalhes": "O corpo do usuário entra em um estado etéreo, tornando-se intangível. Durante esse estado, ataques físicos atravessam seu corpo como névoa." },
                    { "nome": "Alma", "tipo": "Passiva", "desc": "Pode transferir sua alma para outro corpo.", "detalhes": "Permite que o usuário desprenda a própria essência espiritual e a transfira para outro corpo, habitando-o temporariamente." },
                    { "nome": "Absorção", "tipo": "Suporte", "desc": "Pode absorver energia vital de um inimigo.", "detalhes": "Permite drenar diretamente a energia vital ou mágica de um inimigo, convertendo-a em força para si." },
                    { "nome": "Invocação dos Mortos", "tipo": "Invocação", "desc": "Permite invocar corpos de batalha.", "detalhes": "Permite trazer de volta à existência guerreiros esqueletos para lutar ao seu lado." },
                    { "nome": "Ancestral da Morte", "tipo": "Buff", "desc": "Invoca uma entidade que intimida inimigos.", "detalhes": "Você invoca a manifestação de uma entidade ancestral ligada à morte, cuja presença emana terror absoluto." },
                    { "nome": "Tato Espiritual", "tipo": "Passiva", "desc": "Dano direto na alma do inimigo.", "detalhes": "Você marca a alma do inimigo através de um toque etéreo, ferindo diretamente sua essência no plano espiritual." },
                    { "nome": "Mímica", "tipo": "Utilidade", "desc": "Aprende instantaneamente uma habilidade vista.", "detalhes": "Você observa, compreende e replica instantaneamente qualquer habilidade executada diante de você." },
                    { "nome": "Pensamento", "tipo": "Mental", "desc": "Lê e altera pensamentos.", "detalhes": "Você invade a mente de seus alvos, acessando pensamentos, memórias e impulsos ocultos." },
                    { "nome": "Foice Espiritual", "tipo": "Ataque", "desc": "Invoca uma foice que paralisa membros.", "detalhes": "Você invoca uma foice dupla formada de energia espiritual pura. Ela não causa dano físico, mas paralisa a área afetada." }
                ]
            },
            # =========================================
            # CLASSE 2: LADINO
            # =========================================
            {
                "nome": "Ladino",
                "descricao": "Arquitetos do caos e da enganação, roubam magia, copiam técnicas e anulam dons. Usam ilusões e venenos para transformar a força do oponente em fraqueza.",
                "kit": [
                    { "nome": "Roubo de Poder", "tipo": "Passiva", "desc": "Rouba magia e energia a cada golpe.", "detalhes": "Ao acertar um ataque, drena vigor e essência mágica, restaurando sua força proporcionalmente ao dano." },
                    { "nome": "Anulação", "tipo": "Utilidade", "desc": "Bloqueia habilidades do inimigo.", "detalhes": "Permite copiar e usar habilidades do inimigo enquanto impede que ele mesmo as utilize." },
                    { "nome": "Arma Roubada", "tipo": "Utilidade", "desc": "Rouba equipamento à distância.", "detalhes": "Toma para si a arma de um inimigo sem tocá-lo. A arma aparece em suas mãos instantaneamente." },
                    { "nome": "Espelhado", "tipo": "Buff", "desc": "Dobra o dano causado.", "detalhes": "Um selo de amplificação arcana que replica e potencializa o poder do seu equipamento." },
                    { "nome": "Ilusão", "tipo": "Mental", "desc": "Prende o inimigo em um cenário falso.", "detalhes": "Arrasta a mente do inimigo para um cenário falso. A vítima perde a percepção da realidade." },
                    { "nome": "Cópia Perfeita", "tipo": "Passiva", "desc": "Copia o estilo de luta do inimigo.", "detalhes": "Permite espelhar com precisão absoluta o estilo de combate, postura e ritmo de um oponente." },
                    { "nome": "Visão", "tipo": "Passiva", "desc": "Visão de longa distância.", "detalhes": "Expande drasticamente o alcance da percepção visual, distinguindo detalhes a grandes distâncias." },
                    { "nome": "Veneno", "tipo": "Buff", "desc": "Envenena um equipamento.", "detalhes": "Impregna uma arma com toxinas místicas que causam dano contínuo e deterioração." },
                    { "nome": "Cegueira", "tipo": "Ataque", "desc": "Cega o inimigo a cada golpe.", "detalhes": "Envolve os punhos com areia encantada. Golpes bem-sucedidos obstruem a visão do alvo." }
                ]
            },
            # =========================================
            # CLASSE 3: ALQUIMISTA
            # =========================================
            {
                "nome": "Alquimista",
                "descricao": "Eruditos que reescrevem a realidade através de selos arcanos e troca equivalente. Moldam o terreno e alteram o destino no campo de batalha.",
                "kit": [
                    { "nome": "Troca Equivalente", "tipo": "Criação", "desc": "Cria algo em troca de material de mesmo valor.", "detalhes": "Um selo arcano que obedece à lei da troca. Oferece materiais para receber algo de valor proporcional." },
                    { "nome": "Selo da Dor", "tipo": "Debuff", "desc": "Aumenta o dano recebido pelo inimigo.", "detalhes": "Amplifica a percepção de dor do inimigo. Cada golpe recebido ressoa como se fosse duplo." },
                    { "nome": "Selo do Guardião", "tipo": "Defesa", "desc": "Protege um aliado de danos.", "detalhes": "Cria um escudo invisível que desvia impactos e amortece golpes em um aliado." },
                    { "nome": "Selo do Elemento", "tipo": "Controle", "desc": "Altera o bioma e clima local.", "detalhes": "Transforma o ambiente (Deserto, Neve, Floresta, Pântano) a favor do usuário." },
                    { "nome": "Marca do Caçador", "tipo": "Utilidade", "desc": "Rastreia o alvo em qualquer lugar.", "detalhes": "Imprime uma marca espiritual que permite localizar o alvo independentemente da distância." },
                    { "nome": "Selo da Ilusão", "tipo": "Ilusão", "desc": "Muda a aparência de objetos.", "detalhes": "Altera forma, textura e visual de objetos inanimados." },
                    { "nome": "Selo Eterno", "tipo": "Pacto", "desc": "Vínculo de morte: mate ou morra.", "detalhes": "Cria uma ligação vital: se o alvo não morrer pelas suas mãos, você morre." },
                    { "nome": "Selo da Salvação", "tipo": "Suporte", "desc": "Remove estados negativos de aliados.", "detalhes": "Purifica corpos e almas, desfazendo selos, venenos e influências externas." },
                    { "nome": "Selamento", "tipo": "Controle", "desc": "Impede a fuga do inimigo.", "detalhes": "Cria âncoras espirituais que impedem teleporte, voo ou fuga física." },
                    { "nome": "Correntes de Selo", "tipo": "Armadilha", "desc": "Armadilha que prende inimigos.", "detalhes": "Transforma selos no terreno em correntes etéreas que restringem movimentos." },
                    { "nome": "Selo do Pesadelo", "tipo": "Mental", "desc": "Prende a mente do inimigo em um pesadelo.", "detalhes": "Arrasta a mente do alvo para um sonho hostil feito de seus próprios medos." },
                    { "nome": "Selo do Controle", "tipo": "Controle", "desc": "Domina a mente do inimigo.", "detalhes": "Subjuga a vontade do alvo, transformando-o em uma marionete sob seu comando." }
                ]
            },
            # =========================================
            # CLASSE 4: ELEMENTAL DO AR (🌪️)
            # =========================================
            {
                "nome": "Elemental do Ar",
                "descricao": "Mestres da liberdade e da pressão atmosférica. Manipulam correntes de ar para voar, criar lâminas invisíveis e esmagar inimigos.",
                "kit": [
                    { "nome": "Sob Pressão", "tipo": "Controle", "desc": "Comprime o ar ao redor, dificultando movimentos inimigos.", "detalhes": "O usuário comprime o ar ao seu redor. Dificuldade de ações físicas aumenta conforme o nível." },
                    { "nome": "Repulsão", "tipo": "Defesa", "desc": "Libera uma rajada de força cinética para afastar inimigos.", "detalhes": "O usuário libera uma rajada concentrada de força cinética que arremessa corpos e rompe formações." },
                    { "nome": "Autodomínio", "tipo": "Combate", "desc": "Controla equipamentos à distância usando correntes de ar.", "detalhes": "Envolve armas em correntes invisíveis, fazendo-os orbitar ou atacar sob comando mental." },
                    { "nome": "Grito Bárbaro", "tipo": "Tanque", "desc": "Cria uma couraça de ar que aumenta resistência física.", "detalhes": "Compacta o ar formando uma couraça pesada. Aumenta resistência a impactos, mas reduz mobilidade." },
                    { "nome": "Voo", "tipo": "Mobilidade", "desc": "Manipula correntes de ar para voar.", "detalhes": "Cria zonas de sustentação que desafiam a gravidade. Permite planar e voar, com dificuldade crescente em altitude." },
                    { "nome": "Frenesi", "tipo": "Buff", "desc": "Entra em estado de concentração predatória focado em um alvo.", "detalhes": "Foca totalmente em um inimigo, ignorando dor e distrações. Bônus massivos para eliminar o alvo." },
                    { "nome": "Cutilada", "tipo": "Ataque", "desc": "Cria lâminas invisíveis de ar comprimido.", "detalhes": "Condensa o ar em lâminas invisíveis que rasgam o espaço. Pode ajustar direção e tamanho." },
                    { "nome": "Monastério", "tipo": "Mental", "desc": "Manifesta um campo espiritual que altera sentidos.", "detalhes": "Campo sereno que altera sentidos. Inimigos sofrem penalidades, aliados ganham clareza." },
                    { "nome": "Presença", "tipo": "Passiva", "desc": "Sentido espacial através das correntes de ar.", "detalhes": "Permite sentir qualquer movimento ou perturbação no ambiente sem necessidade de visão." },
                    { "nome": "Breve Flora", "tipo": "Passiva", "desc": "Magias de natureza ofensiva falham contra o usuário.", "detalhes": "A Natureza reconhece o usuário como memória viva. Magias ofensivas naturais falham." },
                    { "nome": "Teleporte através de Símbolo", "tipo": "Híbrido", "desc": "Teleporte instantâneo entre símbolos gêmeos.", "detalhes": "Teleporte via selos arcanos. Requer dois símbolos idênticos e intactos." }
                ]
            },
            # =========================================
            # OUTROS ELEMENTAIS (Para garantir que existam no banco)
            # =========================================
            { "nome": "Elemental do Fogo", "descricao": "Avatar da chama viva.", "kit": [] },
            { "nome": "Elemental da Água", "descricao": "Fluidez e força das marés.", "kit": [] },
            { "nome": "Elemental da Terra", "descricao": "Resiliência tectônica.", "kit": [] }
        ]

        # --- LÓGICA DE CADASTRO ---
        for c in dados_classes:
            classe_db = Classe.query.filter_by(nome=c["nome"]).first()
            if not classe_db:
                classe_db = Classe(nome=c["nome"], descricao=c["descricao"])
                db.session.add(classe_db)
                db.session.commit()
                print(f"✅ Classe '{c['nome']}' registrada.")
            
            if c["kit"]:
                classe_db.magias_iniciais.clear()
                for h in c["kit"]:
                    magia = Magia.query.filter_by(nome=h["nome"]).first()
                    if not magia:
                        magia = Magia(nome=h["nome"], tipo=h["tipo"], descricao=h["desc"], detalhes=h.get("detalhes", "Sem detalhes."))
                        db.session.add(magia)
                    else:
                        magia.descricao = h["desc"]
                        magia.detalhes = h.get("detalhes", magia.detalhes)
                    classe_db.magias_iniciais.append(magia)
                print(f"   -> Kit de {c['nome']} vinculado.")

        db.session.commit()
        print("🏆 Todas as classes foram sincronizadas!")

if __name__ == "__main__":
    semear_classes()