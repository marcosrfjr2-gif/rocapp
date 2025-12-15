// Projects.js
import { state, elements, saveData, getLocalISODate, toggleModal, toggleProjectModal, showConfirm } from './app.js';
import { renderTasks, processRoutines } from './tasks.js';

export const cropTemplates = {
    // === 1. FOLHOSAS (Ciclo Curto) ===
    alface: [
        { day: -15, title: 'Adubação de Canteiro', desc: 'Preparo Solo.', guide: '<h3>🥬 Preparo de Campeão</h3><p><strong>Por que?</strong> A alface tem raízes curtas e delicadas. Terra dura impede o crescimento.</p><h4>⚖️ Dosagem Exata (por m²):</h4><ul><li><strong>Calcário:</strong> 200g (1 copo americano cheio) se não tiver análise de solo.</li><li><strong>Esterco de Gado:</strong> 15 a 20 Litros (2 baldes).</li><li><strong>Esterco de Galinha:</strong> 5 Litros (meio balde).</li><li><strong>NPK 04-14-08:</strong> 150g (3/4 de copo americano).</li></ul><h4>🛠️ Passo a Passo:</h4><ul><li>Espalhe tudo sobre o canteiro e revire a 30cm com a enxada. Molhe bem.</li></ul>' },
        { day: 0, title: 'Transplante (Lua Cheia/Nova)', desc: 'Mudas.', guide: '<h3>🌑🌕 O Segredo do Pegamento</h3><p><strong>Melhor Lua:</strong> Cheia ou Nova (estimula folhas).</p><h4>🌱 Como Plantar:</h4><ul><li><strong>Hidratação:</strong> Mergulhe a bandeja de mudas em água por 1 min antes de tirar.</li><li><strong>Cuidado Vital:</strong> Não enterre o "colo" (região entre a raiz e o caule), senão a planta apodrece. Deixe rente ao solo.</li><li><strong>Espaçamento:</strong> 25cm entre plantas e linhas.</li></ul>' },
        { day: 10, type: 'routine', freq: 'daily', title: 'Rega Leve e Frequente', desc: 'Manhã/Tarde.', guide: '<h3>💧 Estratégia de Água</h3><p><strong>A Regra:</strong> Solo sempre úmido, nunca encharcado (se apertar a terra na mão, sai água? Tá demais).</p><ul><li><strong>Frequência:</strong> Se estiver calor, regue de manhã cedo (antes das 8h) E no final da tarde (após as 16h).</li></ul>' },
        { day: 15, title: 'Adubação de Cobertura (Nitrogênio)', desc: 'Crescimento.', guide: '<h3>✨ Explosão de Crescimento</h3><p><strong>O que usar:</strong> Sulfato de Amônio ou Ureia.</p><h4>🥄 Dose de Precisão:</h4><ul><li><strong>Por Planta:</strong> 1 colher de chá rasa (aprox 3g).</li><li><strong>Por m²:</strong> 1 colher de sopa cheia espalhada nas entrelinhas.</li><li><strong>Aplicação:</strong> Faça um círculo a 5cm do caule. NUNCA jogue nas folhas (queima!). Regue IMEDIATAMENTE após aplicar para o adubo penetrar.</li></ul>' },
        { day: 30, title: 'Monitoramento de Pragas', desc: 'Lesmas/Pulgões.', guide: '<h3>🐌 Ronda Noturna</h3><p><strong>Inimigos:</strong> Lesmas e Pulgões.</p><ul><li><strong>Pulgão:</strong> Olhe o verso da folha (parte de baixo). Se tiver pontinhos pretos/verdes, aplique Óleo de Neem ou Calda de Detergente (5% neutro).</li><li><strong>Lesmas:</strong> Elas comem à noite. Espalhe cinzas de madeira ou palha de arroz em volta do canteiro (elas não passam pelo seco).</li></ul>' },
        { day: 45, title: 'Colheita', desc: 'Ponto Ideal.', guide: '<h3>🥗 Hora de Colher</h3><p><strong>Ponto Certo:</strong> Antes de começar a subir o miolo (pendoar). Se sair leite branco ao cortar o talo, é sinal que já está passando (pode amargar).</p><ul><li>Colha bem cedo (antes das 9h) para a folha estar crocante de água.</li><li>Corte rente ao solo com faca afiada limpa.</li></ul>' }
    ],
    couve: [
        { day: -15, title: 'Calagem e Adubação Pesada', desc: 'Preparo.', guide: '<h3>🥬 Fundação Robusta</h3><p><strong>Necessidade:</strong> Couve fica meses produzindo, então o berço tem que ser rico.</p><h4>⚖️ Receita do Berço (por m² ou cova):</h4><ul><li><strong>Calcário:</strong> 200g a 300g (1 copo e meio).</li><li><strong>Esterco:</strong> 20 Litros (2 baldes cheios) de gado ou 5L de galinha.</li><li><strong>Adubo Químico:</strong> 200g de NPK 04-14-08 (1 copo americano).</li></ul><ul><li>Misture tudo na terra 15 dias antes. Se for cova, faça 40x40x40cm.</li></ul>' },
        { day: 0, title: 'Plantio das Mudas (Lua Cheia)', desc: 'Transplante.', guide: '<h3>🌕 Lua de Folia</h3><p>Lua Cheia favorece o desenvolvimento das folhas.</p><h4>🌱 Técnica:</h4><ul><li>Faça uma cova de 15cm de profundidade no canteiro preparado.</li><li>Plante a muda firme, enterrando até o início das primeiras folhas verdadeiras. Calque a terra com as mãos.</li></ul>' },
        { day: 20, type: 'routine', freq: 'monthly', title: 'Adubação de Cobertura (N)', desc: 'Nitrogênio.', guide: '<h3>✨ Combustível Mensal</h3><p>Couve é uma máquina de fazer folhas e precisa de <strong>Nitrogênio</strong> constante.</p><h4>🥄 Dose Mensal (Por Planta):</h4><ul><li><strong>Opção 1 (Químico):</strong> 1 colher de sopa rasa de Ureia (10g).</li><li><strong>Opção 2 (Orgânico):</strong> 2 mãos cheias de esterco de galinha curtido ou 1L de esterco de gado.</li><li><strong>Local:</strong> Em círculo, afastado 10cm do tronco. Cubra com terra e regue.</li></ul>' },
        { day: 30, type: 'routine', freq: 'weekly', title: 'Catação de Lagartas', desc: 'Manual.', guide: '<h3>🐛 O Curuquerê</h3><p>A borboleta branca põe ovos amarelos embaixo da folha.</p><ul><li><strong>Ação:</strong> Vire as folhas toda semana. Esmague os ovos com o dedo.</li><li><strong>Lagartas:</strong> Cate manualmente e jogue para as galinhas.</li><li><strong>Defensivo Natural:</strong> Extrato de fumo ou BT (Bacillus thuringiensis) se infestação for alta.</li></ul>' },
        { day: 60, title: 'Início da Colheita Inteligente', desc: 'Folhas Baixas.', guide: '<h3>✂️ Colheita Contínua</h3><p><strong>Como Colher:</strong> Quebre o talo da folha para baixo (sentido da base). Não deixe "tocos" no caule para não entrar fungo.</p><ul><li>Colha sempre as folhas <strong>mais velhas (de baixo)</strong> primeiro.</li><li>Mantenha sempre pelo menos 5 folhas no "olho" (topo) para a planta continuar fazendo fotossíntese.</li></ul>' }
    ],
    rucula: [
        { day: 0, title: 'Semeadura (Lua Cheia)', desc: 'Direta.', guide: '<h3>🌕 Semeadura de Precisão</h3><p>Rúcula não gosta de transplante. Plante direto no local.</p><h4>⚖️ Adubação de Base (Canteiro):</h4><ul><li><strong>Esterco:</strong> 2kg/m².</li><li><strong>NPK 04-14-08:</strong> 100g/m² (meio copo).</li></ul><ul><li><strong>Sulcos:</strong> 20cm entre linhas. 1cm de profundidade.</li><li><strong>Semente:</strong> Derrube 1 semente a cada 2cm. Cubra com terra peneirada.</li></ul>' },
        { day: 15, title: 'Desbaste Obrigatório', desc: 'Raleio.', guide: '<h3>✂️ Menos é Mais</h3><p>Se as plantas ficarem encostadas, elas não crescem e dão fungo.</p><ul><li><strong>Ação:</strong> Arranque as plantinhas menores. Deixe <strong>5cm livres</strong> entre cada pé de rúcula.</li><li>Use os brotos arrancados na salada.</li></ul>' },
        { day: 20, title: 'Adubação Foliar ou Líquida', desc: 'Rápida.', guide: '<h3>✨ Booster Rápido</h3><p>O ciclo é curto (40 dias). O adubo sólido demora a reagir.</p><h4>🥄 Receita:</h4><ul><li>Dilua 1 copo de chorume (biofertilizante) em 10 litros de água.</li><li>Ou use 1 colher de chá de Ureia em 10L de água.</li><li>Regue as plantas com essa mistura no final da tarde.</li></ul>' }
    ],
    cheiro_verde: [
        { day: 0, title: 'Plantio (Salsa e Cebolinha)', desc: 'Consórcio.', guide: '<h3>🌿 A Dupla Dinâmica</h3><p><strong>Preparo do Canteiro:</strong> 5kg de esterco/m² e 100g de NPK 04-14-08.</p><p><strong>Cebolinha:</strong> Gosta de Sol. Plante mudas (touceiras) cortando as folhas em cima e raízes embaixo.</p><p><strong>Salsa:</strong> Semente demora a germinar (até 20 dias!). Deixe a semente na água morna por uma noite antes de plantar.</p>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Adubação Orgânica', desc: 'Esterco.', guide: '<h3>💩 Comida Leve</h3><p>Cebolinha odeia sal (adubo químico excessivo queima a ponta).</p><h4>🥄 Dose Mensal:</h4><ul><li><strong>Esterco de Galinha:</strong> 1 punhado generoso por touceira.</li><li><strong>Húmus de Minhoca:</strong> 200g por touceira.</li><li>Espalhe ao redor e afofe a terra levemente.</li></ul>' }
    ],

    // === 2. FRUTOS ===
    tomate: [
        { day: -30, title: 'Calagem Pesada (Fundo Preto)', desc: 'Cálcio.', guide: '<h3>🍅 Preparo Anti-Podridão</h3><p><strong>Problema:</strong> Fundo Preto (Podridão Apical) é falta de CÁLCIO.</p><h4>⚖️ Correção (por cova/m²):</h4><ul><li><strong>Calcário Dolomítico:</strong> 300g (1 copo e meio). Aplique 30 a 60 dias ANTES.</li><li><strong>Preparo da Cova:</strong> 10 Litros de esterco + 200g de NPK 04-14-08 + 100g de Farinha de Ossos (ótimo cálcio).</li></ul>' },
        { day: 0, title: 'Plantio (Lua Crescente)', desc: 'Mudas.', guide: '<h3>🌒 Plantio Profundo</h3><p><strong>Técnica Ninja:</strong> O tomateiro solta raiz pelo caule.</p><ul><li>Retire as folhas de baixo da muda.</li><li>Enterre a muda <strong>profundamente</strong> (cobrindo 5-10cm do caule pelado).</li><li>Isso dobra o sistema radicular.</li></ul>' },
        { day: 15, title: 'Tutoramento Vertical', desc: 'Amarrar.', guide: '<h3>🪵 Subindo a Serra</h3><p>O tomateiro indeterminado cresce até 2 metros.</p><ul><li>Use estacas de 2,20m.</li><li>Amarre com fitilho fazendo um "8" frouxo para não enforcar o caule quando ele engrossar.</li></ul>' },
        { day: 20, type: 'routine', freq: 'weekly', title: 'Desbrota dos Chupões', desc: 'Poda.', guide: '<h3>✂️ Limpeza de Energia</h3><p><strong>O que tirar:</strong> Brotos que nascem na axila (vão entre o caule e a folha).</p><ul><li>Arranque com a mão quando tiverem menos de 5cm.</li><li>Se deixar crescer, vira uma moita descontrolada com tomates pequenos.</li></ul>' },
        { day: 25, type: 'routine', freq: 'biweekly', title: 'Adubação de Cobertura (K/Ca)', desc: 'Frequente.', guide: '<h3>✨ Comida de Atleta</h3><p>Tomate precisa de comida a cada 15 ou 20 dias.</p><h4>🥄 Dose por Planta:</h4><ul><li><strong>Fase Verde:</strong> 1 colher de sopa de NPK 20-00-20 ou Nutriverde.</li><li><strong>Fase Flor/Fruto:</strong> 2 colheres de sopa de NPK 10-10-10 ou 1 colher de Sulfato de Potássio.</li><li>Espalhe longe do tronco (na projeção da copa) e regue.</li></ul>' },
        { day: 60, title: 'Colheita no Ponto', desc: 'Pintou.', guide: '<h3>🍅 Colheita Estratégica</h3><p><strong>Ponto de Vez:</strong> Quando o fundo começar a ficar laranja ("pintado").</p><ul><li>Colha e deixe madurar na fruteira. Evita ataque de pássaros e broca gigante.</li></ul>' }
    ],
    pimentao: [
        { day: 0, title: 'Plantio (Lua Crescente)', desc: 'Mudas.', guide: '<h3>🫑 Plantio Protegido</h3><p>Pimentão exige solo rico.</p><h4>⚖️ Cova (40x40cm):</h4><ul><li><strong>Esterco:</strong> 5 litros.</li><li><strong>NPK 04-14-08:</strong> 150g (3/4 de copo).</li><li><strong>Calcário:</strong> 100g.</li><li>Misture tudo muito bem.</li></ul>' },
        { day: 20, title: 'Tutoramento em X', desc: 'Suporte.', guide: '<h3>🪵 Suporte em X</h3><p>Os galhos quebram fácil ("rasgam" no tronco).</p><ul><li>Passe fitilhos laterais para sustentar os galhos quando estiverem carregados.</li></ul>' },
        { day: 30, title: 'Adubação de Florada', desc: 'K.', guide: '<h3>✨ Potássio para Frutos</h3><p>A flor caiu? Falta nutrição ou água irregular.</p><h4>🥄 Dose por pé:</h4><ul><li>1 colher de sopa de NPK 10-10-10 a cada 20 dias.</li><li>Se tiver cinzas de madeira, jogue 1 punhado por pé (rico em Potássio).</li></ul>' }
    ],
    quiabo: [
        { day: -30, title: 'Calagem Obrigatória', desc: 'Acidez.', guide: '<h3>☀️ O Rei do Verão</h3><p>Quiabo trava em solo ácido.</p><h4>⚖️ Dosagem:</h4><ul><li><strong>Calcário:</strong> 200g a 300g por m². Incorpore 30 dias antes.</li><li><strong>Adubo Plantio:</strong> 300g de cama de frango por metro linear de sulco.</li></ul>' },
        { day: 0, title: 'Semeadura Direta (Lua Crescente)', desc: 'Direta.', guide: '<h3>🌱 Quebra de Dormência</h3><p>Semente dura.</p><ul><li>Deixe de molho na água por 24h.</li><li>Plante 3 sementes a cada 40cm. Profundidade 2-3cm.</li></ul>' },
        { day: 20, title: 'Desbaste', desc: 'Deixar a melhor.', guide: '<h3>✂️ Uma Só</h3><p>Escolha a melhor planta de cada cova e corte as outras rente ao solo. Não tenha dó.</p>' },
        { day: 40, title: 'Adubação Nitrogenada', desc: 'Crescimento.', guide: '<h3>✨ Força Vegetativa</h3><p>Quando surgirem os botões.</p><h4>🥄 Dose:</h4><ul><li><strong>Ureia:</strong> 1 colher de chá por planta (cuidado, queima!).</li><li>Ou 1 mãozada de esterco de galinha curtido.</li></ul>' },
    ],
    abobora: [
        { day: 0, title: 'Plantio Espaçoso', desc: 'Cova.', guide: '<h3>🎃 Berço Esplêndido</h3><p>Abóbora é gulosa.</p><h4>⚖️ Cova (60x60x60cm):</h4><ul><li><strong>Esterco:</strong> 20 Litros (2 baldes) - exagere mesmo!</li><li><strong>Calcário:</strong> 200g.</li><li><strong>NPK 04-14-08:</strong> 200g.</li><li>Misture e deixe curtir 10 dias.</li></ul>' },
        { day: 45, title: 'Polinização e Adubação', desc: 'Florada.', guide: '<h3>🐝 O Casamento</h3><p>Se as frutinhas apodrecem novas, é falta de polinização (abelha).</p><ul><li><strong>Manual:</strong> Pegue flor macho (cabo fino), tire pétalas e encoste no miolo da fêmea (tem a abobrinha).</li><li><strong>Adubo:</strong> 100g de NPK 10-10-10 por cova na florada.</li></ul>' }
    ],

    // === 3. RAÍZES ===
    cenoura: [
        { day: -15, title: 'Afofamento do Solo', desc: 'Solo Fofo.', guide: '<h3>🥕 Engenharia de Solo</h3><p>Solo duro = Cenoura torta.</p><h4>🛠️ Preparo (m²):</h4><ul><li>Revire a 30cm prof.</li><li><strong>Adubo:</strong> 3kg de composto orgânico muito bem curtido.</li><li><strong>Químico:</strong> 150g de NPK 04-14-08.</li><li><strong>NÃO USE</strong> esterco fresco (bifurca a raiz).</li></ul>' },
        { day: 0, title: 'Semeadura (Lua Minguante)', desc: 'Linhas.', guide: '<h3>🌗 Lua de Descer</h3><p>Misture semente com areia ou borra de café seca para espalhar melhor.</p><ul><li>Sulcos com 20cm de distância.</li><li>Cubra com 0,5cm de terra leve (quase nada).</li></ul>' },
        { day: 25, title: 'Desbaste: O GRANDE SEGREDO', desc: 'Raleio.', guide: '<h3>✂️ Coragem!</h3><p>TEM que ralar.</p><ul><li>Deixe <strong>8cm de distância</strong> entre uma planta e outra.</li><li>Se não fizer isso, você colherá "palitos de dente".</li></ul>' },
        { day: 35, title: 'Adubação de Potássio', desc: 'K.', guide: '<h3>✨ Doçura e Tamanho</h3><p>Cenoura ama Potássio.</p><h4>🥄 Dose (metro linear):</h4><ul><li><strong>Cloreto de Potássio:</strong> 1 colher de sopa, distribuída ao longo da linha.</li><li>Ou Cinzas de Madeira (1 copo por metro).</li><li>Chegue terra nos pés (amontoa) para não deixar o "ombro" verde.</li></ul>' }
    ],
    mandioca: [
        { day: -30, title: 'Preparo Solo Profundo', desc: 'Calagem.', guide: '<h3>📉 Solo Solto</h3><p>Produção aumenta 50% com calagem.</p><h4>⚖️ Dose:</h4><ul><li><strong>Calcário:</strong> 200g a 300g por m² em área total.</li><li><strong>Plantio:</strong> 40g (1 punhado) de fosfato simples na cova/sulco.</li></ul>' },
        { day: 0, title: 'Plantio das Manivas (Lua Minguante)', desc: 'Manivas.', guide: '<h3>🥔 Manivas</h3><p>Manivas de 20cm (5-7 gemas). Plante na horizontal a 10cm de profundidade.</p>' },
        { day: 45, title: 'Adubação de Cobertura', desc: 'N e K.', guide: '<h3>✨ Cobertura</h3><p>Se o solo for fraco.</p><h4>🥄 Dose por planta:</h4><ul><li>1 colher de sopa de NPK 20-00-20 (ou 10-10-10) em volta da planta com solo úmido.</li></ul>' }
    ],
    batata_doce: [
        { day: 0, title: 'Plantio em Camalhões', desc: 'Ramas.', guide: '<h3>🍠 Canteiro Alto</h3><p>Faça camalhões de 40cm de altura.</p><h4>⚖️ Adubação (metro linear):</h4><ul><li>100g de NPK 04-14-08.</li><li>Plante a rama (30cm), enterrando o meio e deixando as pontas pra fora.</li></ul>' },
        { day: 40, title: 'Amontoa', desc: 'Chegar terra.', guide: '<h3>⛰️ Proteção</h3><p>Jogue terra para cobrir as batatas que começam a aparecer. Evita a broca.</p>' }
    ],

    // === 4. GRÃOS ===
    milho: [
        { day: -60, title: 'Calagem (V70%)', desc: 'Frequente.', guide: '<h3>📉 Correção Total</h3><p>Milho exige solo corrigido (V% 70).</p><h4>⚖️ Dose (Hectare / m²):</h4><ul><li><strong>Calcário:</strong> 2 a 4 Ton/ha (200-400g/m²).</li><li>Incorpore 60 dias antes.</li></ul>' },
        { day: 0, title: 'Semeadura Turbo (Lua Crescente)', desc: 'Direto.', guide: '<h3>🌽 Arranque Explosivo</h3><p>Adubação pesada no sulco.</p><h4>⚖️ Dose (metro linear):</h4><ul><li><strong>NPK 08-28-16:</strong> 40g (um punhado generoso) por metro.</li><li>Plante 5 sementes por metro linear. Profundidade 5cm.</li></ul>' },
        { day: 25, title: 'Cobertura V4 (Ureia) - OBRIGATÓRIO', desc: 'Nitrogênio.', guide: '<h3>✨ O Momento da Verdade</h3><p>Quando o milho tiver 4 a 6 folhas (altura joelho).</p><h4>🥄 Dose Crítica:</h4><ul><li><strong>Ureia:</strong> 200kg/ha (ou 20g por metro linear).</li><li>Aplique na lateral, cubra com terra e regue. Se não fizer isso, a espiga fica pequena.</li></ul>' }
    ],
    feijao: [
        { day: 0, title: 'Plantio Raso', desc: 'Semeadura.', guide: '<h3>🫘 Plantio</h3><p>Não enterre muito (2-3cm).</p><h4>⚖️ Adubo (metro linear):</h4><ul><li><strong>NPK 04-14-08:</strong> 30g por metro.</li><li><strong>Inoculante:</strong> Misture Rhizobium na semente (economiza nitrogênio).</li></ul>' },
        { day: 20, title: 'Adubação de Cobertura', desc: 'Nitrogênio.', guide: '<h3>✨ Arrank</h3><p>Feijão precisa de pouco N.</p><h4>🥄 Dose:</h4><ul><li>10g de Ureia por metro linear. Aplique longe do caule para não queimar.</li></ul>' }
    ],

    // === 5. FRUTÍFERAS ===
    pomar: [
        { day: -60, title: 'Preparo da Cova (Berço)', desc: 'Abertura.', guide: '<h3>🕳️ O Berço da Vida</h3><p>Cova 60x60x60cm.</p><h4>⚖️ A Mistura Sagrada:</h4><ul><li>20 Litros de Esterco de Curral (gordo).</li><li>300g de Calcário Dolomítico.</li><li>300g de Fosfato Reativo ou Super Simples.</li><li>60g de Frits (Micronutrientes).</li></ul><ul><li>Misture tudo na terra de cima e jogue no fundo. Deixe curtir 30 dias.</li></ul>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Adubação de Formação', desc: 'Sólida/Foliar.', guide: '<h3>🌳 Crescimento</h3><p>Adube mensalmente no primeiro ano.</p><h4>🥄 Dose por planta:</h4><ul><li>50g de NPK 20-00-20 ou Sulfato de Amônio.</li><li>Aumente a dose conforme a copa cresce.</li></ul>' }
    ],
    banana: [
        { day: 0, title: 'Plantio (Lua Minguante)', desc: 'Rizoma.', guide: '<h3>🍌 Cova Rica</h3><p>Cova 50x50x50cm.</p><h4>⚖️ Adubo:</h4><ul><li>20L de Esterco.</li><li>500g de Calcário.</li><li>500g de Fosfato.</li></ul>' },
        { day: 60, type: 'routine', freq: 'monthly', title: 'Adubação K', desc: 'Potássio.', guide: '<h3>✨ Fome de K</h3><p>Banana devora Potássio.</p><h4>🥄 Dose (Família):</h4><ul><li>100g de Cloreto de Potássio (KCi) + 50g de Ureia TODO MÊS nas chuvas.</li><li>Espalhe em meia-lua na frente da planta mãe e filha.</li></ul>' }
    ],

    // === GERAL / CRIAÇÕES ===
    galinhas_poedeiras: [
        { day: -2, title: 'Limpeza e Caiação', desc: 'Desinfecção.', guide: '<h3>🧼 Higiene</h3><p>Use Cal Hidratada: 1kg para 5 litros de água. Pinte paredes e poleiros.</p>' },
        { day: 0, title: 'Recepção (Círculo)', desc: '32°C.', guide: '<h3>🐤 Conforto</h3><p>Ração Inicial: Forneça à vontade. Consumo esperado: 10-15g/pintinho/dia na 1ª semana.</p>' },
        { day: 0, type: 'routine', freq: 'daily', title: 'Tratos Leves', desc: 'Água/Ração.', guide: '<h3>🔄 Consumo</h3><p>Galinha adulta come ~110-120g de ração/dia. Água: 250ml/cabeça/dia (dobre se fizer calor).</p>' }
    ],
    frangos_corte: [{ day: 0, title: 'Alojamento Inicial', desc: 'Pintinhos.', guide: '<h3>🐥 Conversão</h3><p>Pré-inicial (0-10 dias): Proteína 22%. Consumo acumulado 1ª semana: 160g/ave.</p>' }],
    gado_leite: [{ day: 0, title: 'Rotina de Ordenha', desc: 'Higiene.', guide: '<h3>🥛 Solução Pré-Dipping</h3><p>Use solução de Iodo ou Clorexidina a 2%. Deixe agir por 30 segundos antes de secar.</p>' }],

    // Outros
    manjericao: [{ day: 0, title: 'Plantio', desc: 'Mudas.', guide: '<h3>🌿 Adubo</h3><p>1 copo de húmus de minhoca na cova. Corte as flores sempre.</p>' }],
    alecrim: [{ day: 0, title: 'Plantio', desc: 'Seco.', guide: '<h3>🌿 Solo Pobre</h3><p>Alecrim não gosta de excesso de adubo. Misture areia na cova (50% terra, 50% areia).</p>' }],
    hortela: [{ day: 0, title: 'Plantio', desc: 'Rizoma.', guide: '<h3>🌿 Água</h3><p>Gosta de matéria orgânica. Jogue esterco curtido por cima da terra a cada 3 meses.</p>' }],
    beterraba: [{ day: 0, title: 'Semeadura', desc: 'Direta.', guide: '<h3>✨ Canteiro</h3><p>Igual cenoura. Adubo NPK 04-14-08 (150g/m²). Raleio para 10cm.</p>' }],
    vagem: [{ day: 0, title: 'Plantio', desc: 'Tutor.', guide: '<h3>🫘 Adubo</h3><p>NPK 04-14-08: 1 colher de sopa por cova. Coloque o tutor (vara) ANTES de plantar para não furar a raiz depois.</p>' }],
    abacaxi: [{ day: 0, title: 'Plantio', desc: 'Mudas.', guide: '<h3>🍍 Adubação Axilar</h3><p>5g de Ureia + 5g de KCl dissolvidos em água e aplicados na axila da folha a cada 2 meses.</p>' }],
    melancia: [{ day: 0, title: 'Plantio', desc: 'Espaço.', guide: '<h3>🍉 Cova Rica</h3><p>20L de Esterco + 300g de NPK 04-14-08. Espaçamento 3x3m.</p>' }],
    morango: [{ day: 0, title: 'Plantio', desc: 'Coroa.', guide: '<h3>🍓 Adubo</h3><p>Exigente. Use NPK 12-06-12 se tiver, ou orgânico Bokashi (1 punhado por pé mensal).</p>' }],
    coqueiro: [{ day: 0, title: 'Plantio', desc: 'Muda.', guide: '<h3>🥥 Cova Gigante</h3><p>80x80x80cm. 50L de matéria orgânica + 1kg de calcário + 1kg de fosfato. Sal grosso (KCl): 200g a partir do 6º mês.</p>' }],
    caprinos: [{ day: 0, title: 'Manejo', desc: 'Vermifugação.', guide: '<h3>🐐 Famacha</h3><p>Vermifugue apenas animais com grau 3, 4 ou 5 (pálidos).</p>' }],
    codornas: [{ day: 0, title: 'Alojamento', desc: 'Inicial.', guide: '<h3>🐦 Ração</h3><p>Ração Postura Codornas (24% Proteína). Consumo: 25g/ave/dia.</p>' }],
    patos: [{ day: 0, title: 'Alojamento', desc: 'Inicial.', guide: '<h3>🦆 Rústicos</h3><p>Comem de tudo, mas para crescer rápido use ração inicial de frango.</p>' }],
    cafe: [{ day: 0, title: 'Plantio (Lua Crescente)', desc: 'Mudas.', guide: '<h3>☕ Cova</h3><p>200g de Calcário + 10L de Esterco + 150g de Fosfato na cova. Adubação de cobertura (N) a cada 45 dias nas chuvas (30g/pé).</p>' }]
};

export function getEmojiForType(type) {
    const map = {
        galinhas_poedeiras: '🐔', frangos_corte: '🍗', gado_leite: '🥛', gado_corte: '🥩',
        suinos: '🐖', pomar: '🍊', milho: '🌽', feijao: '🫘', mandioca: '🥔',
        banana: '🍌', coqueiro: '🥥', alface: '🥬', tomate: '🍅', cenoura: '🥕',
        beterraba: '✨', batata_doce: '🍠', abacaxi: '🍍', vagem: '🫘',
        caprinos: '🐐', codornas: '🐦', patos: '🦆', couve: '🥬', rucula: '🌿',
        cheiro_verde: '🌿', manjericao: '🌿', alecrim: '🌿', hortela: '🌿',
        pimentao: '🫑', pepino: '🥒', quiabo: '☀️', abobora: '🎃', melancia: '🍉',
        morango: '🍓'
    };
    return map[type] || '🌱';
}

function getProjectNameForType(type) {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
}

export function getProjectType(culture) {
    if (culture === 'manual') return 'manual';

    // Lista de animais/criações
    const anim = ['galinhas_poedeiras', 'frangos_corte', 'gado_leite', 'gado_corte',
        'suinos', 'caprinos', 'codornas', 'patos', 'tilapias', 'abelhas', 'ovinos'];

    if (anim.includes(culture)) return 'criação';
    return 'cultura';
}

export function renderProjects() {
    elements.projectTabs.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.className = `pill-btn ${state.currentProject === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'Geral';
    allBtn.onclick = () => { state.currentProject = 'all'; renderProjects(); renderTasks(); };
    elements.projectTabs.appendChild(allBtn);

    state.projects.filter(p => p.name !== 'Geral' && p.status === 'active').forEach(p => {
        const btn = document.createElement('button');
        btn.className = `pill-btn ${state.currentProject === p.id ? 'active' : ''}`;
        // Text Content
        const textSpan = document.createElement('span');
        textSpan.textContent = `${p.emoji} ${p.name}`;
        btn.appendChild(textSpan);

        // Delete Button (Span)
        const deleteSpan = document.createElement('span');
        deleteSpan.className = 'delete-project-btn';
        deleteSpan.innerHTML = '&times;';
        deleteSpan.title = 'Apagar';
        deleteSpan.style.marginLeft = '8px';
        deleteSpan.style.opacity = '0.7';

        // Hover effect helper
        deleteSpan.onmouseover = () => deleteSpan.style.opacity = '1';
        deleteSpan.onmouseout = () => deleteSpan.style.opacity = '0.7';

        deleteSpan.onclick = (e) => {
            e.stopPropagation();
            console.log('Delete Project Clicked:', p.id); // Debug
            deleteProject(p.id);
        };

        btn.appendChild(deleteSpan);

        elements.projectTabs.appendChild(btn);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'pill-btn add-project-btn';
    addBtn.textContent = 'Novo Projeto';
    addBtn.onclick = () => toggleProjectModal(true);
    elements.projectTabs.appendChild(addBtn);

    updateProjectSelect();
}

function updateProjectSelect() {
    elements.inputs.project.innerHTML = '';
    state.projects.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.emoji} ${p.name}`;
        if (state.currentProject !== 'all' && state.currentProject === p.id) {
            opt.selected = true;
        }
        elements.inputs.project.appendChild(opt);
    });
}

export function addProject(e) {
    e.preventDefault();
    const culture = elements.inputs.projCulture.value;
    const soilDateVal = elements.inputs.projStartDate.value;
    let plantingDateStr = soilDateVal || getLocalISODate(new Date());

    if (culture === 'manual') {
        const baseName = 'Projeto Manual';
        const existingCount = state.projects.filter(p => p.name.startsWith(baseName)).length;
        const newProject = {
            id: Date.now(),
            name: `${baseName} #${existingCount + 1}`,
            emoji: '📝',
            culture: 'manual',
            type: 'manual',
            status: 'active',
            startDate: plantingDateStr
        };
        state.projects.push(newProject);
        saveData();
        renderProjects();
        state.currentProject = newProject.id;
        renderProjects();
        renderTasks();
        toggleProjectModal(false);
        return;
    }

    const template = cropTemplates[culture];
    let prepDays = 0;
    if (template) {
        const days = template.map(t => t.day);
        const minDay = Math.min(0, ...days);
        prepDays = Math.abs(minDay);
    }

    const soilDate = new Date(plantingDateStr + 'T12:00:00');
    soilDate.setDate(soilDate.getDate() + prepDays);
    const finalPlantingDateStr = getLocalISODate(soilDate);

    const baseName = getProjectNameForType(culture);
    const existingCount = state.projects.filter(p => p.name.startsWith(baseName)).length;

    const newProject = {
        id: Date.now(),
        name: `${baseName} #${existingCount + 1}`,
        emoji: getEmojiForType(culture),
        culture: culture,
        type: getProjectType(culture),
        status: 'active',
        startDate: finalPlantingDateStr
    };
    state.projects.push(newProject);

    generateProjectTasks(newProject.id, culture, finalPlantingDateStr);

    saveData();
    renderProjects();
    state.currentProject = newProject.id;
    renderProjects();
    renderTasks();
    elements.projectForm.reset();
    toggleProjectModal(false);
}

export function deleteProject(id) {
    showConfirm('Excluir Projeto', 'Tem certeza que deseja apagar este projeto e todas as suas tarefas?', () => {
        // Remove Project
        state.projects = state.projects.filter(p => p.id !== id);

        // Remove Tasks & Routines associated with project
        state.tasks = state.tasks.filter(t => parseInt(t.projectId) !== parseInt(id));
        state.routines = state.routines.filter(r => parseInt(r.projectId) !== parseInt(id));

        // Reset current project if we deleted the active one
        if (state.currentProject === id) {
            state.currentProject = 'all';
        }

        saveData();
        renderProjects();
        renderTasks();
    });
}

function generateProjectTasks(projectId, culture, startDate) {
    const template = cropTemplates[culture];
    if (!template) return;

    template.forEach(item => {
        const itemDate = new Date(startDate + 'T12:00:00');
        itemDate.setDate(itemDate.getDate() + item.day);
        const dateStr = getLocalISODate(itemDate);

        if (item.type === 'routine') {
            state.routines.push({
                id: Date.now() + Math.random(),
                title: item.title,
                description: item.desc,
                frequency: item.freq,
                projectId: projectId,
                nextRun: dateStr,
                guideContent: item.guide
            });
        } else {
            state.tasks.push({
                id: Date.now() + Math.random(),
                title: item.title,
                description: item.desc,
                date: dateStr,
                priority: 'normal',
                completed: false,
                fromRoutine: false,
                projectId: projectId,
                frequency: 'none',
                isAutomated: true,
                guideContent: item.guide
            });
        }
    });

    processRoutines();
}
