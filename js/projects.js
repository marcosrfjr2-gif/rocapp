import { state, elements, saveData, getLocalISODate } from './store.js';
import { toggleModal, toggleProjectModal, showConfirm } from './ui.js';
import { renderTasks, processRoutines } from './tasks.js';

export const cropTemplates = {
    // === 1. FOLHOSAS (Ciclo Curto) ===
    alface: [
        { day: -15, title: 'Adubação e Calagem', desc: 'Preparo Solo.', guide: '<h3>🥬 Preparo de Campeão</h3><p><strong>Por que?</strong> A alface tem raízes curtas e delicadas. Terra dura impede o crescimento.</p><h4>⚖️ Dosagem Exata (por m²):</h4><ul><li><strong>Calcário:</strong> 200g (1 copo americano cheio) se não tiver análise de solo.</li><li><strong>Esterco de Gado:</strong> 15 a 20 Litros (2 baldes).</li><li><strong>Esterco de Galinha:</strong> 5 Litros (meio balde).</li><li><strong>NPK 04-14-08:</strong> 150g (3/4 de copo americano).</li></ul><h4>🛠️ Passo a Passo:</h4><ul><li>Espalhe tudo sobre o canteiro e revire a 30cm com a enxada. Molhe bem.</li></ul>' },
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
        { day: -10, title: 'Preparo do Canteiro', desc: 'Adubação.', guide: '<h3>🌿 Berço de Mudas</h3><p>Solo bem fofo e adubado.</p><h4>⚖️ Adubação (m²):</h4><ul><li><strong>Esterco:</strong> 2kg/m².</li><li><strong>NPK 04-14-08:</strong> 100g/m².</li></ul>' },
        { day: 0, title: 'Semeadura (Lua Cheia)', desc: 'Direta.', guide: '<h3>🌕 Semeadura</h3><p>Plante em sulcos com 20cm de distância. Cubra com terra peneirada (0,5cm).</p>' },
        { day: 15, title: 'Desbaste Obrigatório', desc: 'Raleio.', guide: '<h3>✂️ Raleio</h3><p>Deixe 5cm entre as plantas. As arrancadas podem ser consumidas.</p>' },
        { day: 20, title: 'Adubação Foliar', desc: 'Rápida.', guide: '<h3>✨ Booster</h3><p>Use biofertilizante ou ureia diluída (0.5%) nas folhas ao entardecer.</p>' },
        { day: 40, title: 'Colheita', desc: 'Corte.', guide: '<h3>✂️ Colheita</h3><p>Arrancar a planta inteira ou cortar as folhas maiores.</p>' }
    ],
    cheiro_verde: [
        { day: -10, title: 'Adubação do Canteiro', desc: 'Preparo.', guide: '<h3>🌿 Solo Rico</h3><p>Misture 5kg de esterco/m² e 100g de NPK 04-14-08.</p>' },
        { day: 0, title: 'Plantio', desc: 'Mudas/Sementes.', guide: '<h3>🌱 Plantio</h3><p>Cebolinha gosta de sol. Salsa demora a nascer (hidrate a semente).</p>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Adubação Orgânica', desc: 'Manutenção.', guide: '<h3>💩 Comida</h3><p>Use esterco de galinha ou húmus. Evite salitre (queima a folha).</p>' },
        { day: 60, title: 'Colheita Contínua', desc: 'Folhas Externas.', guide: '<h3>✂️ Consumo</h3><p>Colha as folhas mais velhas (externas) para a planta continuar renovando o miolo.</p>' }
    ],

    // === 2. FRUTOS ===
    tomate: [
        { day: -30, title: 'Calagem Pesada (Fundo Preto)', desc: 'Cálcio.', guide: '<h3>🍅 Preparo Anti-Podridão</h3><p><strong>Problema:</strong> Fundo Preto (Podridão Apical) é falta de CÁLCIO.</p><h4>⚖️ Correção (por cova/m²):</h4><ul><li><strong>Calcário Dolomítico:</strong> 300g (1 copo e meio). Aplique 30 a 60 dias ANTES.</li><li><strong>Preparo da Cova:</strong> 10 Litros de esterco + 200g de NPK 04-14-08 + 100g de Farinha de Ossos (ótimo cálcio).</li></ul>' },
        { day: 0, title: 'Plantio (Lua Crescente)', desc: 'Mudas.', guide: '<h3>🌒 Plantio Profundo</h3><p><strong>Técnica Ninja:</strong> O tomateiro solta raiz pelo caule.</p><ul><li>Retire as folhas de baixo da muda.</li><li>Enterre a muda <strong>profundamente</strong> (cobrindo 5-10cm do caule pelado).</li><li>Isso dobra o sistema radicular.</li></ul>' },
        { day: 15, title: 'Tutoramento Vertical', desc: 'Amarrar.', guide: '<h3>🪵 Subindo a Serra</h3><p>O tomateiro indeterminado cresce até 2 metros.</p><ul><li>Use estacas de 2,20m.</li><li>Amarre com fitilho fazendo um "8" frouxo para não enforcar o caule quando ele engrossar.</li></ul>' },
        { day: 20, type: 'routine', freq: 'weekly', title: 'Desbrota dos Chupões', desc: 'Poda.', guide: '<h3>✂️ Limpeza de Energia</h3><p><strong>O que tirar:</strong> Brotos que nascem na axila (vão entre o caule e a folha).</p><ul><li>Arranque com a mão quando tiverem menos de 5cm.</li><li>Se deixar crescer, vira uma moita descontrolada com tomates pequenos.</li></ul>' },
        { day: 25, type: 'routine', freq: 'biweekly', title: 'Adubação de Cobertura (K/Ca)', desc: 'Frequente.', guide: '<h3>✨ Comida de Atleta</h3><p>Tomate precisa de comida a cada 15 ou 20 dias.</p><h4>🥄 Dose por Planta:</h4><ul><li><strong>Fase Verde:</strong> 1 colher de sopa de NPK 20-00-20 ou Nutriverde.</li><li><strong>Fase Flor/Fruto:</strong> 2 colheres de sopa de NPK 10-10-10 ou 1 colher de Sulfato de Potássio.</li><li>Espalhe longe do tronco (na projeção da copa) e regue.</li></ul>' },
        { day: 90, title: 'Colheita', desc: 'Ponto de Vez.', guide: '<h3>🍅 Colheita</h3><p>Colha quando o fruto estiver "pintando" (começando a avermelhar) para evitar ataque de pássaros.</p>' }
    ],
    pimentao: [
        { day: -30, title: 'Calagem e Preparo', desc: 'Correção.', guide: '<h3>🫑 Solo Rico</h3><p>Aplique 100g de calcário por cova e misture bem. Adube com 5L de esterco e 150g de NPK 04-14-08.</p>' },
        { day: 0, title: 'Plantio (Lua Crescente)', desc: 'Mudas.', guide: '<h3>🌱 Transplante</h3><p>Plante a muda com torrão. Evite cobrir o caule acima do nível original.</p>' },
        { day: 20, title: 'Tutoramento', desc: 'Suporte.', guide: '<h3>🪵 Estaqueamento</h3><p>Pimentão tem galhos quebradiços. Use estacas de 80cm e amarre os galhos conforme crescem.</p>' },
        { day: 30, title: 'Adubação de Cobertura', desc: 'Potássio.', guide: '<h3>✨ Frutos</h3><p>Aplique 1 colher de sopa de NPK 10-10-10 a cada 20 dias.</p>' },
        { day: 90, title: 'Colheita', desc: 'No Tamanho.', guide: '<h3>🫑 Colheita</h3><p>Colha quando atingir o tamanho máximo e estiver firme e brilhante. Se quiser vermelho, espere madurar (mas produz menos).</p>' }
    ],
    quiabo: [
        { day: -30, title: 'Calagem Obrigatória', desc: 'Acidez.', guide: '<h3>☀️ O Rei do Verão</h3><p>Quiabo trava em solo ácido.</p><h4>⚖️ Dosagem:</h4><ul><li><strong>Calcário:</strong> 200g a 300g por m². Incorpore 30 dias antes.</li><li><strong>Adubo Plantio:</strong> 300g de cama de frango por metro linear de sulco.</li></ul>' },
        { day: 0, title: 'Semeadura Direta (Lua Crescente)', desc: 'Direta.', guide: '<h3>🌱 Quebra de Dormência</h3><p>Semente dura.</p><ul><li>Deixe de molho na água por 24h.</li><li>Plante 3 sementes a cada 40cm. Profundidade 2-3cm.</li></ul>' },
        { day: 20, title: 'Desbaste', desc: 'Seleção.', guide: '<h3>✂️ Uma Só</h3><p>Deixe apenas a planta mais forte por cova.</p>' },
        { day: 40, title: 'Adubação Nitrogenada', desc: 'Crescimento.', guide: '<h3>✨ Força</h3><p>Na floração, aplique 1 colher de chá de Ureia por planta (longe do caule).</p>' },
        { day: 60, type: 'routine', freq: 'daily', title: 'Colheita Diária', desc: 'Ponto.', guide: '<h3>🔪 Todo Dia</h3><p>Quiabo cresce rápido e "passa" (fica duro). Colha todo dia quando a ponta quebrar fácil.</p>' }
    ],
    abobora: [
        { day: -15, title: 'Preparo da Cova', desc: 'Matéria Orgânica.', guide: '<h3>🎃 Berço</h3><p>Cova 60x60cm. Encha com 20 Litros de esterco e 200g de NPK 04-14-08.</p>' },
        { day: 0, title: 'Plantio (Lua Crescente)', desc: 'Sementes.', guide: '<h3>🌱 Semeadura</h3><p>3 sementes por cova (2cm prof.). Desbaste deixando 2 plantas.</p>' },
        { day: 45, title: 'Polinização Manual', desc: 'Ajuda.', guide: '<h3>🐝 O Casamento</h3><p>Pegue a flor macho (cabo fino) e esfregue no miolo da fêmea (tem a abobrinha) pela manhã.</p>' },
        { day: 90, title: 'Colheita', desc: 'Madura.', guide: '<h3>🎃 Ponto</h3><p>Quando o cabinho (pedúnculo) secar ou a casca estiver dura (unha não entra).</p>' }
    ],
    pepino: [
        { day: -10, title: 'Adubação de Cova', desc: 'Preparo.', guide: '<h3>🥒 Cova Rica</h3><p>10L de Esterco + 100g de NPK 04-14-08.</p>' },
        { day: 0, title: 'Plantio (Lua Crescente)', desc: 'Mudas/Sementes.', guide: '<h3>🌱 Plantio</h3><p>2 sementes por cova. Precisa de suporte (cerca/tela).</p>' },
        { day: 25, title: 'Condução', desc: 'Amarrio.', guide: '<h3>🪵 Subindo</h3><p>Conduza a rama principal verticalmente. Pode as brotações laterais até 40cm do chão.</p>' },
        { day: 45, title: 'Adubação de Produção', desc: 'K.', guide: '<h3>✨ Frutificação</h3><p>1 colher de sopa de NPK 10-10-10 por pé a cada 15 dias.</p>' },
        { day: 60, type: 'routine', freq: 'daily', title: 'Colheita', desc: 'Frequente.', guide: '<h3>🥒 Todo Dia</h3><p>Não deixe crescer demais senão amarga e enfraquece a planta.</p>' }
    ],
    melancia: [
        { day: -20, title: 'Preparo do Solo', desc: 'Cova.', guide: '<h3>🍉 Espaço</h3><p>Espaçamento 3x3m. Cova 50x50x50 com 20L de Esterco + 300g NPK 04-14-08.</p>' },
        { day: 0, title: 'Plantio (Lua Crescente)', desc: 'Sementes.', guide: '<h3>🌱 Semeadura</h3><p>4 sementes por cova. Depois desbaste para deixar 2 plantas.</p>' },
        { day: 40, title: 'Penteado das ramas', desc: 'Organização.', guide: '<h3>🌿 Ramas</h3><p>Distribua as ramas uniformemente para não se cruzarem.</p>' },
        { day: 85, title: 'Colheita', desc: 'Ponto.', guide: '<h3>🍉 O Som</h3><p>Geralmente 85-100 dias. Gavinhas secas perto do fruto. Som "oco" ao bater.</p>' }
    ],
    morango: [
        { day: -20, title: 'Preparo do Canteiro', desc: 'Alto.', guide: '<h3>🍓 Camalhão</h3><p>Faça canteiros altos (30cm). Use muito composto orgânico e NPK 04-14-08.</p>' },
        { day: 0, title: 'Plantio', desc: 'Mudas.', guide: '<h3>🌱 Coroa</h3><p>Nunca enterre a coroa (centro) da muda. Use mulching (plástico) para forrar o chão.</p>' },
        { day: 30, type: 'routine', freq: 'biweekly', title: 'Adubação Foliar', desc: 'Micros.', guide: '<h3>✨ Nutrição</h3><p>Adubação foliar com Cálcio e Boro ajuda na firmeza do fruto.</p>' },
        { day: 60, title: 'Colheita', desc: 'Vermelho.', guide: '<h3>🍓 Manhã</h3><p>Colha os frutos totalmente vermelhos, cortando o talinho (não puxe).</p>' }
    ],
    abacaxi: [
        { day: 0, title: 'Plantio (Lua Minguante)', desc: 'Mudas.', guide: '<h3>🍍 Plantio</h3><p>Enterre a base da muda 10cm. Espaçamento 90x30cm.</p>' },
        { day: 60, type: 'routine', freq: 'monthly', title: 'Adubação Axilar', desc: 'Foliar.', guide: '<h3>✨ Adubo na Folha</h3><p>O abacaxi come pelas folhas. Aplique mistura de Ureia e Potássio na axila das folhas basais.</p>' },
        { day: 365, title: 'Indução Floral', desc: 'Carbureto.', guide: '<h3>🌸 Forçar Flor</h3><p>Se a planta estiver grande mas não der flor com 1 ano, aplique solução indutora no olho.</p>' },
        { day: 500, title: 'Colheita', desc: 'Amarelo.', guide: '<h3>🍍 Doce</h3><p>Colha quando os "olhinhos" da base ficarem amarelos.</p>' }
    ],
    maracuja: [
        { day: -30, title: 'Montagem da Espaldeira', desc: 'Cerca.', guide: '<h3>🏗️ Estrutura</h3><p>Instale moirões com 1 arame liso a 2m de altura. Cova 40x40x40cm adubada.</p>' },
        { day: 0, title: 'Plantio (Lua Crescente)', desc: 'Mudas.', guide: '<h3>🌱 Plantio</h3><p>Plante a muda e coloque um tutor (vara/barbante) até o arame.</p>' },
        { day: 30, title: 'Condução e Poda', desc: 'Formação.', guide: '<h3>✂️ Formação</h3><p>Remova todos os brotos laterais até a planta chegar no arame. Lá em cima, corte a ponta para abrir 2 braços.</p>' },
        { day: 60, title: 'Polinização Manual', desc: 'Mamangava.', guide: '<h3>🐝 Polinização</h3><p>Se não tiver abelhas grandes (mamangavas), faça manual no início da tarde (13h-15h).</p>' },
        { day: 180, title: 'Colheita', desc: 'Chão.', guide: '<h3>🍋 Colheita</h3><p>O melhor ponto é quando o fruto cai no chão. Recolha diariamente.</p>' }
    ],

    // === 3. RAÍZES ===
    cenoura: [
        { day: -15, title: 'Afofamento Profundo', desc: 'Solo.', guide: '<h3>🥕 Engenharia</h3><p>O solo deve ser fofo a 30cm. Adube com NPK 04-14-08. NÃO use esterco fresco.</p>' },
        { day: 0, title: 'Semeadura (Lua Minguante)', desc: 'Linhas.', guide: '<h3>🌗 Semeadura</h3><p>Sulcos rasos (1cm). Misture a semente com areia para não cair demais.</p>' },
        { day: 25, title: 'Desbaste (CRÍTICO)', desc: 'Raleio.', guide: '<h3>✂️ Coragem</h3><p>Deixe 8cm entre plantas. Se não fizer, colherá cenouras finas e tortas.</p>' },
        { day: 45, title: 'Adubação de Cobertura', desc: 'K.', guide: '<h3>✨ Potássio</h3><p>Aplique Cloreto de Potássio ou Cinzas na entre-linha e cubra com terra (amontoa) para não esverdear o "ombro".</p>' },
        { day: 90, title: 'Colheita', desc: 'Tamanho.', guide: '<h3>🥕 Ponto</h3><p>Geralmente 90-110 dias. Oculte o ombro da cenoura para verificar o diâmetro.</p>' }
    ],
    beterraba: [
        { day: -10, title: 'Preparo Solo', desc: 'Adubo.', guide: '<h3>✨ Canteiro</h3><p>Gosta de Boro. Se possível, aplique Bórax no solo. Adubação NPK 04-14-08.</p>' },
        { day: 0, title: 'Semeadura (Lua Minguante)', desc: 'Direta.', guide: '<h3>🌗 Sementes</h3><p>Cada "semente" da beterraba é um glomérulo com várias sementes dentro. Vai precisar ralear.</p>' },
        { day: 25, title: 'Desbaste', desc: 'Raleio.', guide: '<h3>✂️ Seleção</h3><p>Deixe 10-12cm entre plantas. Use as folhas do desbaste na salada.</p>' },
        { day: 70, title: 'Colheita', desc: 'Tamanho.', guide: '<h3>✨ Colheita</h3><p>Não deixe crescer demais (tipo coco) senão fica dura. Tamanho de bola de tênis é ideal.</p>' }
    ],
    mandioca: [
        { day: -30, title: 'Calagem', desc: 'Solo.', guide: '<h3>📉 Acidez</h3><p>Mandioca dobra a produção com calagem. Aplique 200g/m² 30 dias antes.</p>' },
        { day: 0, title: 'Plantio (Lua Minguante)', desc: 'Manivas.', guide: '<h3>🥔 Manivas</h3><p>Pedados de 20cm do meio da planta (nem a ponta verde, nem o pé lenhoso). Plante horizontal a 10cm prof.</p>' },
        { day: 45, title: 'Adubação de Cobertura', desc: 'N e K.', guide: '<h3>✨ Força</h3><p>Aplique 40g de NPK 20-00-20 por planta se o solo for fraco.</p>' },
        { day: 240, title: 'Início da Colheita', desc: 'Raízes.', guide: '<h3>🥔 Mesa/Indústria</h3><p>Mandioca de mesa: 8 a 12 meses. Indústria: até 18 meses. Pode o pé a 10cm do solo antes de arrancar.</p>' }
    ],
    batata_doce: [
        { day: 0, title: 'Plantio das Ramas', desc: 'Camalhão.', guide: '<h3>🍠 Camalhão</h3><p>Faça leiras altas (30-40cm). Plante ramas de 30cm (ponta) enterrando o meio (U) ou inclinada.</p>' },
        { day: 45, title: 'Amontoa', desc: 'Terra.', guide: '<h3>⛰️ Proteção</h3><p>Chegue terra no pé para cobrir as batatas e evitar a Broca.</p>' },
        { day: 120, title: 'Colheita', desc: 'Seca.', guide: '<h3>🍠 Ponto</h3><p>Quando a folhagem começar a amarelar e secar. Corte a rama dias antes de arrancar.</p>' }
    ],

    // === 4. GRÃOS ===
    milho: [
        { day: -30, title: 'Calagem e Adubação', desc: 'Preparo.', guide: '<h3>🌽 Fome</h3><p>Milho exige muito. Calagem V70%. Adubação de base forte com NPK 08-28-16.</p>' },
        { day: 0, title: 'Semeadura (Lua Crescente)', desc: 'Direta.', guide: '<h3>🌱 Plantio Turbo</h3><p>3 sementes por metro linear (se for alta tecnologia) ou 5 sementes (baixa tec).</p>' },
        { day: 25, title: 'Adubação de Cobertura (V4)', desc: 'Nitrogênio.', guide: '<h3>✨ Ureia</h3><p>Quando estiver com 4 a 6 folhas (altura do joelho). Aplique Ureia e cubra. Indispensável!</p>' },
        { day: 80, title: 'Milho Verde', desc: 'Colheita 1.', guide: '<h3>🌽 Pamonha</h3><p>Quando o cabelo da espiga secar e ficar marrom. Aperte o grão: deve sair um leite.</p>' },
        { day: 130, title: 'Milho Seco', desc: 'Colheita 2.', guide: '<h3>🌽 Grão</h3><p>Quando a planta inteira secar e a espiga virar para baixo.</p>' }
    ],
    feijao: [
        { day: 0, title: 'Semeadura', desc: 'Raso.', guide: '<h3>🫘 Plantio</h3><p>2 a 3cm de profundidade. 10 a 15 sementes por metro. Use inoculante se possível.</p>' },
        { day: 25, title: 'Adubação Leve', desc: 'N.', guide: '<h3>✨ Cobertura</h3><p>Feijão precisa de pouco nitrogênio (metade do milho). Aplique 10g de ureia por metro linear.</p>' },
        { day: 85, title: 'Colheita', desc: 'Seco.', guide: '<h3>🫘 Vagem Seca</h3><p>Quando as vagens secarem ("baterem cascavel"). Colha e deixe secar mais ao sol antes de debulhar.</p>' }
    ],
    vagem: [
        { day: 0, title: 'Semeadura com Tutor', desc: 'Vara.', guide: '<h3>🫘 Suporte</h3><p>Coloque as varas (tutor) ANTES de plantar. 2 sementes por cova ao lado da vara.</p>' },
        { day: 20, title: 'Condução', desc: 'Amarrio.', guide: '<h3>🪵 Subida</h3><p>Ajude a planta a "pegar" na vara. Adube com 1 colher de NPK 10-10-10.</p>' },
        { day: 60, type: 'routine', freq: 'daily', title: 'Colheita', desc: 'Terna.', guide: '<h3>🫘 Todo dia</h3><p>Colha a vagem ainda terna, antes de marcar o feijão dentro. Se granar, a planta para de produzir.</p>' }
    ],

    // === 5. CULTURAS PERENES ===
    pomar: [
        { day: -60, title: 'Cova Farta', desc: 'Abertura.', guide: '<h3>🕳️ Berço</h3><p>60x60x60cm. Misture cal, fosfato e muito esterco (20L). Deixe curtir 2 meses.</p>' },
        { day: 0, title: 'Plantio', desc: 'Muda.', guide: '<h3>🌳 Plantio</h3><p>Não enterre o enxerto. Faça uma "bacia" em volta para segurar água de rega.</p>' },
        { day: 60, type: 'routine', freq: 'monthly', title: 'Adubação de Formação', desc: 'N.', guide: '<h3>✨ Crescer</h3><p>Adube todo mês com NPK 20-00-20 (50g) nas chuvas para a copa crescer rápido.</p>' }
    ],
    banana: [
        { day: 0, title: 'Plantio (Lua Minguante)', desc: 'Rizoma.', guide: '<h3>🍌 Cova</h3><p>50x50cm. Use 2kg de cinzas se tiver, ou 500g de calcário e 500g de Fosfato.</p>' },
        { day: 30, title: 'Desbaste de Filhos', desc: 'Família.', guide: '<h3>👨‍👩‍👧 Mãe, Filha, Neta</h3><p>Mantenha apenas 1 Família por touceira: Planta mãe (com cacho), Filha (média) e Neta (broto).</p>' },
        { day: 60, type: 'routine', freq: 'monthly', title: 'Adubação de Potássio', desc: 'K.', guide: '<h3>✨ Muito K</h3><p>Banana exige muito Potássio. 100g de KCl por touceira todo mês.</p>' },
        { day: 300, title: 'Corte do Coração', desc: 'Umbigo.', guide: '<h3>🍌 Mangará</h3><p>15 dias após sair a última penca, corte o "umbigo" (mangará) para o cacho engordar mais.</p>' },
        { day: 400, title: 'Colheita', desc: 'Cacho.', guide: '<h3>🍌 Ponto</h3><p>Quando as quinas das bananas arredondarem. Corte a planta mãe (pseudocaule) após a colheita, ela não produz mais.</p>' }
    ],
    coqueiro: [
        { day: 0, title: 'Plantio', desc: 'Muda.', guide: '<h3>🥥 Espaço</h3><p>Triângulo de 7x7m. Cova 80cm³. Muito material orgânico no fundo.</p>' },
        { day: 180, type: 'routine', freq: 'quarterly', title: 'Adubação Salgada', desc: 'Cloreto.', guide: '<h3>🌊 Sal</h3><p>Coqueiro gosta de Cloro. Adube com Cloreto de Potássio (KCl) ou Sal Grosso (sem iodo, se achar) a cada 3 meses.</p>' }
    ],
    cafe: [
        { day: 0, title: 'Plantio (Lua Crescente)', desc: 'Mudas.', guide: '<h3>☕ Cova</h3><p>Profunda (40cm). Use Fosfato de liberação lenta. Plantio no início das chuvas.</p>' },
        { day: 60, type: 'routine', freq: 'monthly', title: 'Adubação Nitrogenada', desc: 'N.', guide: '<h3>✨ Nitrogênio</h3><p>Café em formação precisa de N a cada 30-45 dias. (30g de ureia/pé).</p>' },
        { day: 730, title: 'Colheita Seletiva', desc: 'Cereja.', guide: '<h3>☕ Cereja</h3><p>Colha apenas os grãos vermelhos (cereja) para qualidade máxima.</p>' }
    ],
    cana: [
        { day: 0, title: 'Plantio dos Toletes', desc: 'Sulcos.', guide: '<h3>🎋 Sulcos</h3><p>Sulcos profundos (20cm). Coloque os toletes "pé com ponta" e cubra com 5cm de terra.</p>' },
        { day: 90, title: 'Adubação e Amontoa', desc: 'N e K.', guide: '<h3>✨ Terra</h3><p>Jogue terra na base das canas e adube com NPK 20-05-20.</p>' },
        { day: 365, title: 'Colheita', desc: 'Corte.', guide: '<h3>🎋 Corte Basal</h3><p>Corte rente ao chão. A cana rebrota (soca) para o próximo ano.</p>' }
    ],

    // === 6. ERVAS e OUTROS ===
    manjericao: [
        { day: 0, title: 'Plantio', desc: 'Mudas.', guide: '<h3>🌿 Sol</h3><p>Gosta de Sol pleno e solo úmido mas drenado.</p>' },
        { day: 30, type: 'routine', freq: 'monthly', title: 'Poda de Flores', desc: 'Renovar.', guide: '<h3>✂️ Segredo</h3><p>Corte SEMPRE as flores assim que surgirem. Se ele florir, as folhas perdem o aroma e a planta morre logo.</p>' }
    ],
    alecrim: [
        { day: 0, title: 'Plantio', desc: 'Drenagem.', guide: '<h3>🌿 Rústico</h3><p>Alecrim odeia raiz encharcada. Misture areia na cova. Pouco adubo.</p>' },
        { day: 60, title: 'Poda de Pontas', desc: 'Formação.', guide: '<h3>✂️ Formato</h3><p>Pode as pontas para ele encher (ficar redondo) e não caneludo.</p>' }
    ],
    hortela: [
        { day: 0, title: 'Plantio Controlado', desc: 'Vaso/Canteiro.', guide: '<h3>🌿 Invasora</h3><p>A raiz da hortelã invade tudo. Melhor plantar em vaso ou ter canteiro isolado. Gosta de muita água.</p>' }
    ],

    // === 7. ANIMAIS ===
    galinhas_poedeiras: [
        { day: -7, title: 'Vazio Sanitário', desc: 'Limpeza.', guide: '<h3>🧼 Desinfecção</h3><p>Retire toda a cama velha, lave e use cal. Deixe o galinheiro descansar 7 dias.</p>' },
        { day: 0, title: 'Alojamento das Aves', desc: 'Entrada.', guide: '<h3>🐔 Recepção</h3><p>Água fresca e ração à vontade. Ninhos limpos (1 para cada 5 galinhas).</p>' },
        { day: 0, type: 'routine', freq: 'daily', title: 'Coleta de Ovos', desc: 'Ovos.', guide: '<h3>🥚 Coleta</h3><p>Colete 2 a 3 vezes ao dia para evitar quebra e ovos sujos.</p>' },
        { day: 0, type: 'routine', freq: 'daily', title: 'Completar Ração', desc: '110g/ave.', guide: '<h3>🌽 Comida</h3><p>Poedeira come ~110g/dia. Não deixe faltar Cálcio (conchas) para a casca do ovo.</p>' }
    ],
    frangos_corte: [
        { day: 0, title: 'Alojamento Pintinhos', desc: 'Aquecimento.', guide: '<h3>🐥 Círculo</h3><p>Círculo de proteção, campânula acesa (32°C) e ração pré-inicial.</p>' },
        { day: 21, title: 'Troca de Ração', desc: 'Crescimento.', guide: '<h3>🐓 Engorda</h3><p>Mudar para ração de crescimento/engorda. Abrir espaço no galpão.</p>' },
        { day: 45, title: 'Abate', desc: 'Ponto.', guide: '<h3>🍗 Final</h3><p>Com 45 dias o frango atinge 2.5kg a 3kg. Jejum de 8h antes do abate.</p>' }
    ],
    gado_leite: [
        { day: 0, type: 'routine', freq: 'daily', title: 'Ordenha (Higiene)', desc: 'Tetos.', guide: '<h3>🥛 Mastite Não</h3><p>1. Teste da caneca (fundo preto). <br> 2. Pré-dipping (iodo). <br> 3. Secar papel toalha. <br> 4. Ordenhar. <br> 5. Pós-dipping (selar teto).</p>' },
        { day: 0, type: 'routine', freq: 'monthly', title: 'Controle Carrapato', desc: 'Banho.', guide: '<h3>🐂 Parasitas</h3><p>Monitore carrapatos e mosca-do-chifre. Banhe se necessário (rodízio de princípios ativos).</p>' }
    ],
    gado_corte: [
        { day: 0, type: 'routine', freq: 'quarterly', title: 'Vermifugação', desc: 'Sanidade.', guide: '<h3>💉 Calendário</h3><p>Vermifugação estratégica (Entrada da seca, meio da seca, entrada das águas).</p>' },
        { day: 0, type: 'routine', freq: 'monthly', title: 'Pesagem e Sal', desc: 'GMD.', guide: '<h3>⚖️ Ganho</h3><p>Monitore o peso. Sal mineral no cocho SEMPRE à vontade (boca cheia).</p>' }
    ],
    suinos: [
        { day: 0, title: 'Limpeza Diária', desc: 'Baia.', guide: '<h3>🧹 Seco</h3><p>Mantenha a baia limpa e seca. Suíno limpo cresce mais e adoece menos.</p>' },
        { day: 0, type: 'routine', freq: 'daily', title: 'Alimentação', desc: 'Ração.', guide: '<h3>🐖 Dieta</h3><p>Ração balanceada de acordo com a fase (leitão, crescimento, terminação). Água fresca à vontade.</p>' }
    ],
    ovinos: [
        { day: 0, type: 'routine', freq: 'monthly', title: 'Casqueamento', desc: 'Cascos.', guide: '<h3>✂️ Pés</h3><p>Corte o excesso de casco para evitar podridão. Ovinos sofrem muito com problemas de pata.</p>' },
        { day: 0, type: 'routine', freq: 'monthly', title: 'Vermifugação (Famacha)', desc: 'Olho.', guide: '<h3>🐐 Famacha</h3><p>Examine a mucosa do olho. Vermelha (ok). Pálida/Branca (verme = vermifugar). Não vermifugue todo mundo sem precisar.</p>' }
    ],
    tilapias: [
        { day: 0, title: 'Povoamento', desc: 'Alevinos.', guide: '<h3>🐟 Aclimatação</h3><p>Deixe o saco flutuar 20min na água do tanque para igualar temperatura. Misture água aos poucos.</p>' },
        { day: 0, type: 'routine', freq: 'daily', title: 'Alimentação', desc: 'Ração.', guide: '<h3>🐟 Arraçoamento</h3><p>Alimente 3 a 4 vezes ao dia. Observe: sobrou ração? Diminua amanhã. Peixe comeu tudo em 5 min? Dê mais um pouco.</p>' }
    ],
    abelhas: [
        { day: 0, type: 'routine', freq: 'biweekly', title: 'Revisão', desc: 'Ninho.', guide: '<h3>🐝 Rainha</h3><p>Tem ovos frescos (larva em C)? Rainha está ok. Tem espaço? Coloque melgueira.</p>' },
        { day: 0, title: 'Colheita Mel', desc: 'Operculado.', guide: '<h3>🍯 Mel Maduro</h3><p>Só colha quadros com mais de 80% dos favos fechados (operculados). Mel verde fermenta.</p>' }
    ]
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
        morango: '🍓', maracuja: '🍋', cana: '🎋', tilapias: '🐟', abelhas: '🐝', ovinos: '🐑'
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
    showConfirm('Apagar Projeto', 'Tem certeza que quer apagar esse projeto? Isso vai apagar TODAS as tarefas dele. Não tem volta!', () => {
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

export function generateProjectTasks(projectId, culture, startDate) {
    const template = cropTemplates[culture];
    if (!template) return;

    template.forEach(item => {
        // Helper to check if task exists (prevent duplicates during repair)
        // Note: For repair logic, we might need a more sophisticated check,
        // but for fresh generation this is standard.
        // We will add a 'dedupe' parameter optionally?
        // Actually, let's keep it simple. The repair logic in app.js checks if *any* automated tasks exist.
        // If we want to UPSERT, we need to handle it there or here.
        // Let's modify this function to support "upsert" (add only if missing).

        const itemDate = new Date(startDate + 'T12:00:00');
        itemDate.setDate(itemDate.getDate() + item.day);
        const dateStr = getLocalISODate(itemDate);

        // Check duplicates
        const taskExists = state.tasks.some(t =>
            parseInt(t.projectId) === parseInt(projectId) &&
            t.title === item.title &&
            t.isAutomated
        );

        const routineExists = state.routines.some(r =>
            parseInt(r.projectId) === parseInt(projectId) &&
            r.title === item.title
        );

        if (taskExists || routineExists) return; // Skip if exists

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
