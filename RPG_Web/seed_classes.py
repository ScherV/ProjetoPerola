from app import app
from database import db
from models import Classe, Magia

def semear_classes():
    with app.app_context():
        print("⚔️ Forjando as Classes e Habilidades...")

        # --- LISTA MESTRA DE CLASSES ---
        dados_classes = [
            # =========================================
            # CLASSE 1: CEIFEIRO (Completa)
            # =========================================
            {
                "nome": "Ceifeiro",
                "descricao": "Mestres do limiar etéreo, os Ceifeiros não causam apenas feridas físicas, mas rompem a própria essência espiritual. Capazes de transitar intocáveis entre os planos e comandar as forças do pós-vida, eles manipulam almas, drenam energia vital e invocam ancestrais para ditar o julgamento final no campo de batalha.",
                "kit": [
                    {
                        "nome": "Translúcido",
                        "tipo": "Defesa",
                        "desc": "Permite ser intocável para tudo que for material.",
                        "detalhes": "O corpo do usuário entra em um estado etéreo, tornando-se intangível. Durante esse estado, ataques físicos atravessam seu corpo como névoa e sua presença se torna quase nula."
                    },
                    {
                        "nome": "Alma",
                        "tipo": "Passiva",
                        "desc": "Pode transferir sua alma para outro corpo.",
                        "detalhes": "Permite que o usuário desprenda a própria essência espiritual e a transfira para outro corpo, habitando-o temporariamente como se fosse seu. A consciência é preservada, e o corpo escolhido passa a ser controlado diretamente pela alma transferida.\n\nOBSERVAÇÃO:\n• O corpo precisa estar morto para que a transferência seja possível.\n• As habilidades do corpo morto podem ser utilizadas uma única vez, mas o usuário perderá o controle do corpo imediatamente após o uso da habilidade."
                    },
                    {
                        "nome": "Absorção",
                        "tipo": "Suporte",
                        "desc": "Pode absorver energia vital de um inimigo.",
                        "detalhes": "Permite drenar diretamente a energia vital ou mágica de um inimigo, convertendo-a em força para si. A cada uso, o alvo sente sua resistência e poder se esvair enquanto o usuário se fortalece.\n\nOBSERVAÇÃO:\n• O usuário escolhe se deseja absorver energia vital ou magia ao ativar a habilidade.\n• Enquanto a magia estiver ativa, o usuário é incapaz de matar seu alvo pessoalmente.\n• A magia prevalece por até 1D6 turnos."
                    },
                    {
                        "nome": "Invocação dos Mortos",
                        "tipo": "Invocação",
                        "desc": "Permite invocar corpos de batalha.",
                        "detalhes": "Permite trazer de volta à existência guerreiros esqueletos para lutar ao seu lado. Esses corpos de batalha são animados por sua energia vital e mágica, agindo como extensões da sua própria força no campo de combate.\n\nOBSERVAÇÃO:\n• Os esqueletos são destruídos automaticamente quando você está em exaustão.\n• Quanto maior o nível, mais estável e obediente é a invocação.\n• Não possui limite de turnos, dependendo inteiramente do invocador.\n• As invocações não usam magia."
                    },
                    {
                        "nome": "Ancestral da Morte",
                        "tipo": "Buff",
                        "desc": "Você invoca um monstro que intimida os inimigos.",
                        "detalhes": "Você invoca a manifestação de uma entidade ancestral ligada à morte, cuja presença emana terror absoluto. Sua aparição distorce o ambiente e corrói a coragem dos inimigos apenas com sua existência.\n\nOBSERVAÇÃO:\n• Testes de Coragem e consequências ficam a critério do sistema usado.\n• A duração da invocação depende do sucesso na execução da habilidade."
                    },
                    {
                        "nome": "Tato Espiritual",
                        "tipo": "Passiva",
                        "desc": "Permite causar dano em um inimigo no plano espiritual.",
                        "detalhes": "Você marca a alma do inimigo através de um toque etéreo, ferindo diretamente sua essência no plano espiritual. O corpo permanece de pé, mas o destino da alma já foi selado.\n\nOBSERVAÇÃO:\n• Qualquer magia de restauração anula esta habilidade.\n• Caso o usuário não se livre da magia até o fim predeterminado da mesma, ele poderá se tornar um dos demônios da ansiedade ou depressão.\n• A marca matará seu alvo caso o mesmo possua pouca magia."
                    },
                    {
                        "nome": "Mímica",
                        "tipo": "Utilidade",
                        "desc": "Permite aprender instantaneamente alguma habilidade vista.",
                        "detalhes": "Você observa, compreende e replica instantaneamente qualquer habilidade executada diante de você, imitando não apenas a forma, mas também a lógica mágica e física por trás da técnica."
                    },
                    {
                        "nome": "Pensamento",
                        "tipo": "Mental",
                        "desc": "Permite ler, visualizar, e alterar pensamentos.",
                        "detalhes": "Você invade a mente de seus alvos, acessando pensamentos, memórias e impulsos ocultos, interferindo diretamente na consciência alheia conforme o domínio da habilidade evolui."
                    },
                    {
                        "nome": "Foice Espiritual",
                        "tipo": "Ataque",
                        "desc": "Invoca uma foice dupla que paralisa a parte cortada.",
                        "detalhes": "Você invoca uma foice dupla formada de energia espiritual pura. Ela não causa dano físico, mas todo membro atingido é temporariamente desligado do plano espiritual, resultando em paralisia total da área afetada."
                    }
                ]
            },

            # =========================================
            # CLASSE 2: LADINO (Modelo para você preencher)
            # =========================================
            {
                "nome": "Ladino",
                "descricao": "Arquitetos do caos e da enganação, os Ladinos são especialistas na apropriação de poder alheio. Não se limitam a roubar ouro; eles roubam magia, copiam técnicas de combate perfeitas e anulam os dons de seus inimigos. Usando ilusões e venenos, transformam a força do oponente em sua maior fraqueza.",
                "kit": [
                    {
                        "nome": "Roubo de Poder",
                        "tipo": "Passiva",
                        "desc": "Permite roubar magia e energia vital a cada golpe certo.",
                        "detalhes": "Ao acertar um ataque, o usuário drena parte do vigor e da essência mágica do alvo, restaurando sua força física e magia proporcionalmente ao dano causado. Quanto maior o nível da habilidade, mais golpes consecutivos podem aplicar o efeito e maior é a porcentagem drenada.\n\nOBSERVAÇÃO:\n• Caso esteja utilizando alguma arma cortante em mãos, o efeito da habilidade é cortado pela metade."
                    },
                    {
                        "nome": "Anulação",
                        "tipo": "Utilidade",
                        "desc": "Permite utilizar até três habilidades de um inimigo, bloqueando-as para ele.",
                        "detalhes": "Esta habilidade permite copiar e usar habilidades do inimigo enquanto impede que ele mesmo as utilize. Ao anular, você retira momentaneamente a técnica escolhida do arsenal do alvo, como se ela estivesse bloqueada. A cada nível, você amplia quantas habilidades consegue anular simultaneamente."
                    },
                    {
                        "nome": "Arma Roubada",
                        "tipo": "Utilidade",
                        "desc": "Permite roubar o equipamento de um inimigo sem tocá-lo.",
                        "detalhes": "Esta habilidade permite que você tome para si a arma ou equipamento ofensivo de um inimigo sem precisar tocá-lo. A arma roubada se manifesta em suas mãos instantaneamente. Essa habilidade só possui limitação por distância e visual.\n\nOBSERVAÇÃO:\n• A habilidade não funciona em Darkins, Cóticas, ou armas que carreguem magia enquanto o portador inicial estiver vivo. Caso o mesmo morra, a magia pode ser utilizada normalmente."
                    },
                    {
                        "nome": "Espelhado",
                        "tipo": "Buff",
                        "desc": "Permite dobrar o dano causado.",
                        "detalhes": "Um selo de amplificação arcana que replica e potencializa o poder do seu equipamento. Ao ativá-lo, a arma ganha um brilho espelhado, como se duplicasse sua própria força, aumentando drasticamente o impacto de cada golpe."
                    },
                    {
                        "nome": "Ilusão",
                        "tipo": "Mental",
                        "desc": "Permite causar ilusão em um inimigo.",
                        "detalhes": "Um selo mental capaz de arrastar a mente do inimigo para um cenário falso, distorcido ou personalizado pelo usuário. A vítima perde a percepção da realidade, reagindo apenas ao mundo ilusório que você cria. Enquanto mantida, a ilusão exige foco absoluto — o que imobiliza o usuário até seu término.\n\nOBSERVAÇÃO:\n• Você não se move enquanto a ilusão estiver ativa."
                    },
                    {
                        "nome": "Cópia Perfeita",
                        "tipo": "Passiva",
                        "desc": "Você copia perfeitamente a técnica de luta de um inimigo.",
                        "detalhes": "Um selo de replicação marcial que permite espelhar, com precisão absoluta, o estilo de combate de um inimigo. Ao copiar sua técnica, você imita postura, ritmo, respiração, movimentos e até padrões de decisão — como se tivesse treinado a vida inteira naquele estilo."
                    },
                    {
                        "nome": "Visão",
                        "tipo": "Passiva",
                        "desc": "Permite ver em longas distâncias com precisão.",
                        "detalhes": "Um aprimoramento sensorial que expande drasticamente o alcance da sua percepção visual. O usuário passa a distinguir formas, movimentos e detalhes com precisão extrema, mesmo a grandes distâncias ou em ambientes parcialmente obscurecidos."
                    },
                    {
                        "nome": "Veneno",
                        "tipo": "Buff",
                        "desc": "Permite envenenar um equipamento.",
                        "detalhes": "Um selo químico e arcano que impregna uma arma ou equipamento com toxinas místicas. Cada golpe passa a injetar substâncias corrosivas no alvo, causando dano imediato e deterioração contínua ao corpo inimigo.\n\nOBSERVAÇÃO:\n• Em qualquer nível se tem o limite de até quatro acertos; ataques errados não contabilizam."
                    },
                    {
                        "nome": "Cegueira",
                        "tipo": "Ataque",
                        "desc": "Areia sai de seus punhos cegando um inimigo a cada golpe.",
                        "detalhes": "Uma técnica que envolve os punhos com partículas de areia encantada. A cada golpe bem-sucedido, o inimigo tem sua visão tomada por uma tempestade ilusória que obstrui completamente seus sentidos visuais.\n\nOBSERVAÇÃO:\n• Em qualquer nível se tem o limite de até quatro acertos; ataques errados não contabilizam."
                    }
                ]
            },

            # =========================================
            # CLASSE 3: ALQUIMISTA
            # =========================================
            {
                "nome": "Alquimista",
                "descricao": "Eruditos das leis universais, os Alquimistas não apenas compreendem a realidade, mas a reescrevem através de selos arcanos. Respeitando o princípio da Troca Equivalente, eles moldam o terreno, aprisionam mentes em pesadelos e alteram o destino de aliados e inimigos. Para eles, o campo de batalha é apenas mais um laboratório onde a matéria, a vida e a magia são transmutadas à sua vontade.",
                "kit": [
                    {
                        "nome": "Troca Equivalente",
                        "tipo": "Criação",
                        "desc": "Coloque algo sob o selo e peça algo de mesmo valor.",
                        "detalhes": "Um selo arcano que obedece a uma lei universal: nada é criado do nada. Ao ativá-lo, o usuário oferece materiais ou energia para receber algo de valor proporcional. O selo não mente, não trapaceia e não permite barganhas injustas, ele responde apenas à lógica da equivalência. A qualidade do item obtido sempre depende diretamente do valor, pureza e raridade do material oferecido. Quanto melhor o sacrifício, melhor a criação."
                    },
                    {
                        "nome": "Selo da Dor",
                        "tipo": "Debuff",
                        "desc": "Coloque um selo sob o inimigo, ele fará o dano sob o inimigo ser maior.",
                        "detalhes": "Um grifo amaldiçoado que, ao ser marcado no corpo de um inimigo, amplifica sua própria percepção de dor e fragilidade. Enquanto o selo estiver ativo, cada golpe recebido ressoa como se fosse sentido duas vezes, estilhaçando a resistência física e mental da vítima.\n\nOBSERVAÇÃO:\n• Somente um inimigo pode carregar o selo por vez.\n• A duração é de três turnos.\n• Se o alvo morrer antes disso, o selo simplesmente se desfaz no ar como fumaça escarlate."
                    },
                    {
                        "nome": "Selo do Guardião",
                        "tipo": "Defesa",
                        "desc": "Coloque o selo sob um aliado, ele irá diminuir o dano recebido.",
                        "detalhes": "Um sigilo ancestral de proteção, desenhado para envolver um aliado em uma aura viva que reage ao perigo. Quando ativado, o selo cria um escudo invisível que se interpõe entre o alvo e o dano, desviando impactos, amortecendo golpes e, em níveis avançados, anulando completamente ferimentos que seriam fatais.\n\nOBSERVAÇÃO:\n• Apenas um aliado pode carregá-lo por vez.\n• A duração é de três turnos."
                    },
                    {
                        "nome": "Selo do Elemento",
                        "tipo": "Controle",
                        "desc": "O ambiente onde o selo for aplicado será alterado conforme desejado.",
                        "detalhes": "Ao posicionar o selo em uma área, o ambiente ao redor é transformado de acordo com o elemento desejado — moldando o clima, o terreno e as condições naturais a favor do usuário.\n\nOBSERVAÇÃO:\n• O selo permite transformar o ambiente entre Deserto, Neve, Natureza (floresta) e Pântano.\n• A duração da mudança depende da precisão da execução e da resistência natural do local — quanto mais bem-sucedido o usuário for ao ativar o selo, mais tempo o ambiente permanecerá alterado."
                    },
                    {
                        "nome": "Marca do Caçador",
                        "tipo": "Utilidade",
                        "desc": "Aquele que receber seu selo poderá ser localizado independente da distância.",
                        "detalhes": "Ao aplicar este selo sobre um alvo, uma marca espiritual invisível é impressa em sua essência. Enquanto a marca perdurar, o usuário pode sentir, rastrear e localizar o alvo independentemente da distância, como se ambos estivessem ligados por um fio sobrenatural.\n\nOBSERVAÇÃO:\n• A marca só pode ser aplicada a um único alvo por vez.\n• Enquanto alguém estiver marcado, não é possível aplicar o selo em outro."
                    },
                    {
                        "nome": "Selo da Ilusão",
                        "tipo": "Ilusão",
                        "desc": "O item que for selado terá a aparência que o usuário desejar.",
                        "detalhes": "Ao aplicar este selo sobre um item, o usuário envolve o objeto em um véu arcano capaz de alterar sua forma, textura e características visuais. Esta magia não pode ser usada em seres vivos, somente em objetos inanimados.\n\nOBSERVAÇÃO:\n• A duração da ilusão nos níveis um e dois depende da precisão da execução.\n• Somente um item pode ser selado por vez — enquanto um objeto estiver sob o efeito do selo, não é possível aplicá-lo a outro (o primeiro voltará ao estado original)."
                    },
                    {
                        "nome": "Selo Eterno",
                        "tipo": "Pacto",
                        "desc": "Aumenta os atributos e talentos contra um único inimigo. Mate-o ou morra.",
                        "detalhes": "Um pacto proibido inscrito em sangue arcano. Ao aplicar este selo sobre um alvo, o usuário cria uma ligação vital irreversível: ou o selado morre pelas suas mãos… ou você morrerá em seu lugar. O Selo Eterno não distingue piedade, moralidade ou circunstância — apenas exige o cumprimento de seu propósito.\n\nOBSERVAÇÃO:\n• Enquanto um inimigo estiver marcado pelo Selo Eterno, não é possível aplicá-lo a outro.\n• O usuário morre caso o alvo morra por outra pessoa, por outra causa, ou caso simplesmente sobreviva ao confronto."
                    },
                    {
                        "nome": "Selo da Salvação",
                        "tipo": "Suporte",
                        "desc": "Livrará um aliado de qualquer selo, machucado ou veneno.",
                        "detalhes": "Um selo sagrado capaz de purificar corpos, almas e fluxos arcanos. Ao aplicá-lo sobre um aliado, você desfaz forças que o aprisionam, curando estados negativos e quebrando influências externas — embora não anule o dano já recebido, apenas suas consequências contínuas.\n\nOBSERVAÇÃO:\n• O aliado ainda sofre o dano inicial que causou o machucado, veneno ou selo. O Selo da Salvação apenas encerra seus efeitos contínuos.\n• A duração e estabilidade da purificação dependem do sucesso da execução e da força do usuário."
                    },
                    {
                        "nome": "Selamento",
                        "tipo": "Controle",
                        "desc": "O inimigo selado não poderá fugir até o selo sumir.",
                        "detalhes": "Um selo de contenção arcana que cria âncoras espirituais ao redor dos alvos. Qualquer criatura marcada fica impossibilitada de escapar — seja correndo, se teletransportando, voando ou atravessando dimensões — até que o selo se dissipe.\n\nOBSERVAÇÃO:\n• A duração depende do sucesso da execução, podendo durar de alguns minutos a até horas.\n• O selo não impede o alvo de lutar, mas remove qualquer possibilidade de fuga física ou mágica."
                    },
                    {
                        "nome": "Correntes de Selo",
                        "tipo": "Armadilha",
                        "desc": "Cria selos no terreno de onde correntes saem após ativação.",
                        "detalhes": "Uma técnica avançada de conjuração rúnica que transforma selos fixos no terreno em âncoras de captura, das quais surgem correntes etéreas capazes de restringir, puxar, prender ou interromper movimentos hostis. Funciona como uma armadilha arcana ativada manualmente pelo usuário.\n\nOBSERVAÇÃO:\n• A duração depende da qualidade da execução — selos mal feitos quebram facilmente.\n• Impossível colocar o selo diretamente sob um ser vivo. Eles só podem ser inscritos em superfícies sólidas, objetos ou terreno.\n• Se o terreno for destruído, o selo também é."
                    },
                    {
                        "nome": "Selo do Pesadelo",
                        "tipo": "Mental",
                        "desc": "Prenderá um inimigo em um pesadelo.",
                        "detalhes": "Uma técnica proibida da arte dos selos, capaz de arrastar a mente do inimigo para um sonho hostil, onde seus medos, traumas e inseguranças ganham forma. O alvo cai em um transe profundo, aprisionado em seu próprio subconsciente, sem distinguir a realidade de ilusão. Quanto mais selos usados, mais estável é o portal mental que leva ao pesadelo.\n\nOBSERVAÇÃO:\n• A duração mínima é de quinze minutos, podendo ser muito maior conforme a qualidade da execução.\n• Pesadelos mal construídos podem permitir que o alvo perceba que está preso em uma ilusão — o que o torna imprevisível e perigoso dentro do sonho.\n• O selo precisa ser ativado sem interrupções; se o usuário for atingido antes da ativação, o efeito não ocorre.\n• O alvo permanece inconsciente e imóvel, exceto por espasmos involuntários."
                    },
                    {
                        "nome": "Selo do Controle",
                        "tipo": "Controle",
                        "desc": "Controle o inimigo selado.",
                        "detalhes": "Uma técnica proibida entre os seladores, capaz de subjugar totalmente a vontade de outro ser. Quando ativado, o selo invade a mente do alvo como fios invisíveis, transformando-o em uma marionete sob comando do usuário. A resistência mental do inimigo determina o esforço necessário, mas o efeito, quando bem-sucedido, é absoluto. A quantidade de selos define a estabilidade da dominação.\n\nOBSERVAÇÃO:\n• A duração da habilidade depende do sucesso na execução, podendo variar de alguns minutos até períodos prolongados.\n• O controle não cura, não apaga dor, e não protege o alvo; ele apenas obedece.\n• Caso o selo seja quebrado, o inimigo pode ficar desorientado por alguns instantes devido ao choque."
                    }
                ]
            }
        ]

        # --- LÓGICA DE CADASTRO (Não precisa mexer aqui) ---
        for c in dados_classes:
            # 1. Criar Classe
            classe_db = Classe.query.filter_by(nome=c["nome"]).first()
            if not classe_db:
                classe_db = Classe(nome=c["nome"], descricao=c["descricao"])
                db.session.add(classe_db)
                db.session.commit() # Salva para gerar ID
                print(f"✅ Classe '{c['nome']}' registrada.")
            
            # 2. Limpar Kit Antigo (Para permitir atualizações sem duplicar)
            classe_db.magias_iniciais.clear()

            # 3. Criar e Vincular Habilidades
            for h in c["kit"]:
                magia = Magia.query.filter_by(nome=h["nome"]).first()
                
                if not magia:
                    # Se não existe, cria do zero
                    magia = Magia(
                        nome=h["nome"], 
                        tipo=h["tipo"], 
                        descricao=h["desc"],
                        detalhes=h.get("detalhes", "Sem detalhes.")
                    )
                    db.session.add(magia)
                    print(f"   -> Nova Habilidade criada: {h['nome']}")
                else:
                    # Se já existe, ATUALIZA os textos (caso você tenha mudado a descrição)
                    magia.descricao = h["desc"]
                    magia.detalhes = h.get("detalhes", magia.detalhes)
                
                # Vincula à classe
                classe_db.magias_iniciais.append(magia)
            
            print(f"   -> Kit de {c['nome']} vinculado com {len(c['kit'])} habilidades.")

        db.session.commit()
        print("🏆 Todas as classes e habilidades foram sincronizadas!")

if __name__ == "__main__":
    semear_classes()