document.addEventListener('DOMContentLoaded', () => {
    const teamData = {
        "PANINI": { iso: "un", color: "#d3a826" }, // Dourado especial
        
        // Hosts
        "CAN": { iso: "ca", color: "#ff0000" },
        "USA": { iso: "us", color: "#002868" },
        "MEX": { iso: "mx", color: "#006341" },

        // AFC (Ásia)
        "KSA": { iso: "sa", color: "#006400" },
        "AUS": { iso: "au", color: "#ffcd00" },
        "QAT": { iso: "qa", color: "#8a1538" },
        "KOR": { iso: "kr", color: "#c60c30" },
        "IRN": { iso: "ir", color: "#239f40" },
        "IRQ": { iso: "iq", color: "#007a3d" },
        "JPN": { iso: "jp", color: "#000555" },
        "JOR": { iso: "jo", color: "#ce1126" },
        "UZB": { iso: "uz", color: "#0099b5" },

        // CAF (África)
        "RSA": { iso: "za", color: "#007749" },
        "ALG": { iso: "dz", color: "#006233" },
        "CPV": { iso: "cv", color: "#003893" },
        "CIV": { iso: "ci", color: "#f77f00" },
        "EGY": { iso: "eg", color: "#ce1126" },
        "GHA": { iso: "gh", color: "#ce1126" },
        "MAR": { iso: "ma", color: "#c1272d" },
        "COD": { iso: "cd", color: "#007fff" },
        "SEN": { iso: "sn", color: "#00853f" },
        "TUN": { iso: "tn", color: "#e70013" },

        // CONMEBOL (América do Sul)
        "ARG": { iso: "ar", color: "#43A1D5" },
        "BRA": { iso: "br", color: "#009c3b" },
        "COL": { iso: "co", color: "#fcd116" },
        "ECU": { iso: "ec", color: "#ffdd00" },
        "PAR": { iso: "py", color: "#d52b1e" },
        "URU": { iso: "uy", color: "#0038a8" },

        // UEFA (Europa)
        "GER": { iso: "de", color: "#000000" },
        "AUT": { iso: "at", color: "#ed2939" },
        "BEL": { iso: "be", color: "#e30613" },
        "BIH": { iso: "ba", color: "#001489" },
        "CRO": { iso: "hr", color: "#ff0000" },
        "SCO": { iso: "gb-sct", color: "#005eb8" },
        "ESP": { iso: "es", color: "#c60b1e" },
        "FRA": { iso: "fr", color: "#002395" },
        "NED": { iso: "nl", color: "#f36c21" },
        "ENG": { iso: "gb-eng", color: "#cf081f" },
        "NOR": { iso: "no", color: "#ba0c2f" },
        "POR": { iso: "pt", color: "#ff0000" },
        "CZE": { iso: "cz", color: "#11457e" },
        "SWE": { iso: "se", color: "#004b87" },
        "SUI": { iso: "ch", color: "#ff0000" },
        "TUR": { iso: "tr", color: "#e30a17" },

        // Concacaf
        "CUW": { iso: "cw", color: "#002b7f" },
        "HAI": { iso: "ht", color: "#d21034" },
        "PAN": { iso: "pa", color: "#c8102e" },

        // OFC (Oceania)
        "NZL": { iso: "nz", color: "#000000" }, // Assumi Nova Zelândia como a 48ª seleção
        
        "FWC": { iso: "un", color: "#8a1538" } // Especial
    };

    const teams = Object.keys(teamData);

    const STICKERS_PER_TEAM = 20;
    let TOTAL_STICKERS = 0;
    teams.forEach(t => { TOTAL_STICKERS += (t === 'PANINI' ? 1 : STICKERS_PER_TEAM) });
    
    // Objeto para armazenar as quantidades: { "BRA 1": 0, "BRA 2": 2, ... }
    let albumData = {};
    let currentFilter = 'all'; // 'all', 'missing', 'repeated'

    // Elementos UI
    const albumContainer = document.getElementById('album-container');
    const percentCompleteEl = document.getElementById('percent-complete');
    const percentMissingEl = document.getElementById('percent-missing');
    const totalRepeatedEl = document.getElementById('total-repeated');
    const progressBar = document.getElementById('progress-bar');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Inicialização
    function init() {
        loadData();
        renderAlbum();
        updateStats();
    }

    // Carregar dados do localStorage
    function loadData() {
        const savedData = localStorage.getItem('copaAlbumData');
        if (savedData) {
            albumData = JSON.parse(savedData);
        } else {
            // Se não houver, inicializa tudo com 0
            teams.forEach(team => {
                const max = team === 'PANINI' ? 0 : STICKERS_PER_TEAM;
                const start = team === 'PANINI' ? 0 : 1;
                for (let i = start; i <= max; i++) {
                    const id = team === 'PANINI' ? "00" : `${team} ${i}`;
                    albumData[id] = 0;
                }
            });
        }
    }

    // Salvar dados no localStorage
    function saveData() {
        localStorage.setItem('copaAlbumData', JSON.stringify(albumData));
        updateStats();
    }

    // Atualiza as estatísticas no cabeçalho
    function updateStats() {
        let acquiredUnique = 0;
        let totalRepeated = 0;

        for (const key in albumData) {
            const count = albumData[key];
            if (count > 0) acquiredUnique++;
            if (count > 1) totalRepeated += (count - 1);
        }

        const missing = TOTAL_STICKERS - acquiredUnique;
        const percentComplete = ((acquiredUnique / TOTAL_STICKERS) * 100).toFixed(1);
        const percentMissing = ((missing / TOTAL_STICKERS) * 100).toFixed(1);

        percentCompleteEl.textContent = `${percentComplete}%`;
        percentMissingEl.textContent = `${percentMissing}%`;
        totalRepeatedEl.textContent = totalRepeated;
        progressBar.style.width = `${percentComplete}%`;
        
        const absCompleteEl = document.getElementById('abs-complete');
        const absMissingEl = document.getElementById('abs-missing');
        if (absCompleteEl) absCompleteEl.textContent = `${acquiredUnique} figurinhas`;
        if (absMissingEl) absMissingEl.textContent = `${missing} figurinhas`;
    }

    // Renderiza todo o álbum na tela
    function renderAlbum() {
        albumContainer.innerHTML = '';

        let teamStatsArray = teams.map(team => {
            let acquired = 0;
            const max = team === 'PANINI' ? 0 : STICKERS_PER_TEAM;
            const start = team === 'PANINI' ? 0 : 1;
            const total = team === 'PANINI' ? 1 : STICKERS_PER_TEAM;

            for (let i = start; i <= max; i++) {
                const id = team === 'PANINI' ? "00" : `${team} ${i}`;
                if (albumData[id] > 0) acquired++;
            }
            return { team, acquired, total };
        });

        // Ordena da seleção que mais tem para a que menos tem
        teamStatsArray.sort((a, b) => b.acquired - a.acquired);

        teamStatsArray.forEach(tStat => {
            const team = tStat.team;
            const tData = teamData[team];
            
            // Cria a seção da seleção
            const section = document.createElement('section');
            section.className = 'team-section';
            section.id = `section-${team}`;
            
            // Personalização da Caixa (Cores de Fundo e Borda)
            section.style.borderTop = `5px solid ${tData.color}`;
            section.style.backgroundColor = `${tData.color}08`; // Fundo com 3% de opacidade da cor principal

            // Cabeçalho da Seleção com Bandeira e Título
            const header = document.createElement('div');
            header.className = 'team-header';
            
            const flag = document.createElement('img');
            flag.src = `https://flagcdn.com/w40/${tData.iso}.png`;
            flag.className = 'team-flag';
            flag.alt = `Bandeira ${team}`;
            
            const title = document.createElement('h2');
            title.className = 'team-title';
            title.textContent = team;
            title.style.color = tData.color;
            
            const statsText = document.createElement('div');
            statsText.className = 'team-stats';
            statsText.id = `stats-${team}`;
            const pct = ((tStat.acquired / tStat.total) * 100).toFixed(0);
            statsText.textContent = `${tStat.acquired}/${tStat.total} (${pct}%)`;

            header.appendChild(flag);
            header.appendChild(title);
            header.appendChild(statsText);
            section.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'stickers-grid';

            let visibleStickersInTeam = 0;

            // Cria as figurinhas daquela seleção
            const max = team === 'PANINI' ? 0 : STICKERS_PER_TEAM;
            const start = team === 'PANINI' ? 0 : 1;

            for (let i = start; i <= max; i++) {
                const stickerId = team === 'PANINI' ? "00" : `${team} ${i}`;
                const count = albumData[stickerId] || 0;

                // Aplicar Filtro
                if (currentFilter === 'missing' && count > 0) continue;
                if (currentFilter === 'repeated' && count <= 1) continue;

                visibleStickersInTeam++;

                // Cria o card da figurinha
                const stickerCard = document.createElement('div');
                
                if (currentFilter === 'missing') {
                    stickerCard.className = 'missing-pill-container';
                    // O botão Undo ganha a cor personalizada da seleção!
                    stickerCard.innerHTML = `
                        <button class="btn-missing-add ${count > 0 ? 'hidden' : ''}" data-id="${stickerId}">${stickerId}</button>
                        <button class="btn-missing-undo ${count === 0 ? 'hidden' : ''}" data-id="${stickerId}" style="background-color: ${tData.color}; border-color: ${tData.color}">↩</button>
                    `;
                } else {
                    stickerCard.className = `sticker ${count === 1 ? 'have' : count > 1 ? 'repeated' : 'missing'}`;
                    stickerCard.innerHTML = `
                        <div class="sticker-header" style="${count > 0 ? `background-color: ${tData.color}` : ''}">${stickerId}</div>
                        <div class="sticker-controls">
                            <button class="btn-minus" data-id="${stickerId}">-</button>
                            <span class="count" id="count-${stickerId}">${count}</span>
                            <button class="btn-plus" data-id="${stickerId}">+</button>
                        </div>
                    `;
                }

                grid.appendChild(stickerCard);
            }

            section.appendChild(grid);

            // Se o filtro ocultou todas as figurinhas dessa seleção, oculta a seção inteira
            if (visibleStickersInTeam > 0) {
                albumContainer.appendChild(section);
            }
        });

        // Adicionar eventos aos botões
        document.querySelectorAll('.btn-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                albumData[id]++;
                saveData();
                updateSingleStickerUI(id, e.target.closest('.sticker'));
            });
        });

        document.querySelectorAll('.btn-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (albumData[id] > 0) {
                    albumData[id]--;
                    saveData();
                    updateSingleStickerUI(id, e.target.closest('.sticker'));
                }
            });
        });

        document.querySelectorAll('.btn-missing-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                albumData[id]++;
                saveData();
                const container = e.target.closest('.missing-pill-container');
                container.querySelector('.btn-missing-add').classList.add('hidden');
                container.querySelector('.btn-missing-undo').classList.remove('hidden');
            });
        });

        document.querySelectorAll('.btn-missing-undo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (albumData[id] > 0) {
                    albumData[id]--;
                    saveData();
                    const container = e.target.closest('.missing-pill-container');
                    container.querySelector('.btn-missing-undo').classList.add('hidden');
                    container.querySelector('.btn-missing-add').classList.remove('hidden');
                }
            });
        });
    }

    // Atualiza a cor e contagem de uma carta específica
    function updateSingleStickerUI(id, cardElement) {
        const count = albumData[id];
        const countSpan = cardElement.querySelector('.count');
        countSpan.textContent = count;

        cardElement.className = `sticker ${count === 1 ? 'have' : count > 1 ? 'repeated' : 'missing'}`;
        
        // Atualiza a cor do cabeçalho da figurinha dependendo do status
        const header = cardElement.querySelector('.sticker-header');
        const teamCode = id === "00" ? "PANINI" : id.split(' ')[0];
        const tData = teamData[teamCode];
        
        if (count > 0) {
            header.style.backgroundColor = tData.color;
            header.style.color = '#fff';
        } else {
            header.style.backgroundColor = ''; // Remove cor inline para voltar ao cinza do CSS
            header.style.color = '';
        }
        
        // Atualizar estatística da seção
        const statsEl = document.getElementById(`stats-${teamCode}`);
        if (statsEl) {
            let acquired = 0;
            const max = teamCode === 'PANINI' ? 0 : STICKERS_PER_TEAM;
            const start = teamCode === 'PANINI' ? 0 : 1;
            const total = teamCode === 'PANINI' ? 1 : STICKERS_PER_TEAM;

            for (let i = start; i <= max; i++) {
                const sId = teamCode === 'PANINI' ? "00" : `${teamCode} ${i}`;
                if (albumData[sId] > 0) acquired++;
            }
            const pct = ((acquired / total) * 100).toFixed(0);
            statsEl.textContent = `${acquired}/${total} (${pct}%)`;
        }
    }

    // Eventos de Filtro
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            currentFilter = e.target.getAttribute('data-filter');
            renderAlbum();
        });
    });

    init();
});
