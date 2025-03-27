document.addEventListener('DOMContentLoaded', function () {
    // Elementos do DOM
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    const wordCount = document.getElementById('wordCount');
    const characterCount = document.getElementById('characterCount');
    const lineCount = document.getElementById('lineCount');
    const uniqueWords = document.getElementById('uniqueWords');
    const longestWord = document.getElementById('longestWord');
    const wordDensity = document.getElementById('wordDensity');
    const charsNoSpaces = document.getElementById('charsNoSpaces');
    const readingTime = document.getElementById('readingTime');
    const readingTimeDetailed = document.getElementById('readingTimeDetailed');
    const sentenceCount = document.getElementById('sentenceCount');
    const searchResults = document.getElementById('searchResults');

    // Elementos para leitura em voz alta
    const readButton = document.getElementById('readButton');
    const stopButton = document.getElementById('stopButton');
    const voiceSelect = document.getElementById('voiceSelect');
    const synth = window.speechSynthesis;
    let utterance = null;

    // Elementos do tradutor
    const translateBtn = document.getElementById('translateBtn');
    const sourceLanguage = document.getElementById('sourceLanguage');
    const targetLanguage = document.getElementById('targetLanguage');
    const translatedText = document.getElementById('translatedText');
    const copyTranslationBtn = document.getElementById('copyTranslationBtn');
    const listenTranslationBtn = document.getElementById('listenTranslationBtn');
    const stopTranslationBtn = document.getElementById('stopTranslationBtn');
    const swapLanguagesBtn = document.getElementById('swapLanguages');
    const clearTranslationBtn = document.getElementById('clearTranslationBtn');

    // Inicialização
    init();

    function init() {
        // Event listeners
        setupEventListeners();

        // Carrega vozes disponíveis
        loadVoices();

        // Atualiza estatísticas iniciais
        updateTextStats();
    }

    function setupEventListeners() {
        // Atualiza contagem de caracteres em tempo real
        textInput.addEventListener('input', updateTextStats);

        // Botões de ação básica
        document.getElementById('countWordsBtn').addEventListener('click', countWords);
        document.getElementById('countCharsBtn').addEventListener('click', countCharacters);
        document.getElementById('upperCaseBtn').addEventListener('click', convertToUpperCase);
        document.getElementById('lowerCaseBtn').addEventListener('click', convertToLowerCase);
        document.getElementById('clearTextBtn').addEventListener('click', clearText);
        document.getElementById('searchBtn').addEventListener('click', searchText);
        document.getElementById('replaceBtn').addEventListener('click', replaceText);
        document.getElementById('copyTextBtn').addEventListener('click', copyText);
        document.getElementById('downloadTextBtn').addEventListener('click', downloadText);

        // Leitura em voz alta
        readButton.addEventListener('click', toggleSpeech);
        stopButton.addEventListener('click', stopSpeech);

        // Tradutor
        translateBtn.addEventListener('click', translateText);
        copyTranslationBtn.addEventListener('click', copyTranslation);
        listenTranslationBtn.addEventListener('click', toggleTranslationSpeech);
        stopTranslationBtn.addEventListener('click', stopTranslation);
        swapLanguagesBtn.addEventListener('click', swapLanguages);
        clearTranslationBtn.addEventListener('click', clearTranslation);

        // Quando as vozes são carregadas
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    function clearTranslation() {
        translatedText.value = '';
        showAlert('Texto traduzido limpo com sucesso.', 'info');
    }

    // Função para carregar vozes disponíveis
    function loadVoices() {
        const voices = synth.getVoices();
        voiceSelect.innerHTML = '';

        if (voices.length === 0) {
            voiceSelect.innerHTML = '<option value="">Nenhuma voz disponível</option>';
            return;
        }

        // Ordena as vozes por idioma
        voices.sort((a, b) => {
            if (a.lang < b.lang) return -1;
            if (a.lang > b.lang) return 1;
            return 0;
        });

        // Filtra apenas vozes em português e inglês para simplificar
        const filteredVoices = voices.filter(voice =>
            voice.lang.includes('pt') || voice.lang.includes('en'));

        // Adiciona as opções de voz
        filteredVoices.forEach(voice => {
            const option = document.createElement('option');
            const voiceName = voice.name.replace(/Microsoft|Online|Desktop|Natural/g, '').trim();
            option.textContent = `${voiceName} (${voice.lang})${voice.default ? ' - Padrão' : ''}`;
            option.value = voice.name;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            voiceSelect.appendChild(option);
        });
    }

    // Função para atualizar todas as estatísticas
    function updateTextStats() {
        const text = textInput.value;

        // Contagem básica
        const charCountValue = text.length;
        charCount.textContent = charCountValue;
        characterCount.textContent = charCountValue;

        // Contagem de palavras
        const words = text.trim() === '' ? [] : text.trim().split(/\s+/);
        const wordCountValue = words.length;
        wordCount.textContent = wordCountValue;

        // Contagem de linhas
        const lineCountValue = text === '' ? 0 : text.split('\n').length;
        lineCount.textContent = lineCountValue;

        // Palavras únicas
        const uniqueWordsSet = new Set(words.map(word => word.toLowerCase().replace(/[.,!?;:]/g, '')));
        uniqueWords.textContent = uniqueWordsSet.size;

        // Palavra mais longa
        if (words.length > 0) {
            const longest = words.reduce((a, b) => {
                const cleanA = a.replace(/[.,!?;:]/g, '');
                const cleanB = b.replace(/[.,!?;:]/g, '');
                return cleanA.length > cleanB.length ? cleanA : cleanB;
            });
            longestWord.textContent = `${longest} (${longest.length} letras)`;
        } else {
            longestWord.textContent = '-';
        }

        // Densidade de palavras
        wordDensity.textContent = lineCountValue > 0 ? (wordCountValue / lineCountValue).toFixed(1) : '0';

        // Caracteres sem espaços
        charsNoSpaces.textContent = text.replace(/\s+/g, '').length;

        // Tempo de leitura (200 palavras/minuto)
        const readingTimeValue = Math.max(1, Math.ceil(wordCountValue / 200));
        readingTime.textContent = readingTimeValue;
        readingTimeDetailed.textContent = readingTimeValue;

        // Contagem de frases (simplificado)
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        sentenceCount.textContent = sentences.length;
    }

    function countWords() {
        updateTextStats();
        showAlert(`Seu texto contém ${wordCount.textContent} palavras.`, 'success');
    }

    function countCharacters() {
        updateTextStats();
        showAlert(`Seu texto contém ${characterCount.textContent} caracteres.`, 'success');
    }

    function convertToUpperCase() {
        textInput.value = textInput.value.toUpperCase();
        updateTextStats();
        showAlert('Texto convertido para MAIÚSCULAS.', 'info');
    }

    function convertToLowerCase() {
        textInput.value = textInput.value.toLowerCase();
        updateTextStats();
        showAlert('Texto convertido para minúsculas.', 'info');
    }

    function clearText() {
        textInput.value = '';
        updateTextStats();
        showAlert('Texto limpo com sucesso.', 'warning');
    }

    function searchText() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        if (!searchTerm) {
            showAlert('Digite um termo para buscar.', 'warning');
            return;
        }

        const text = textInput.value;
        const regex = new RegExp(searchTerm, 'gi');
        const matches = text.match(regex);

        if (matches) {
            searchResults.innerHTML = `Encontrado ${matches.length} ocorrência(s).`;

            // Remove highlights anteriores
            textInput.value = textInput.value.replace(/<span class="highlight">|<\/span>/g, '');

            // Destacar os resultados no texto
            const highlightedText = text.replace(regex, match => `<span class="highlight">${match}</span>`);
            textInput.value = highlightedText;
        } else {
            searchResults.innerHTML = 'Nenhuma ocorrência encontrada.';
        }
    }

    function replaceText() {
        const findText = document.getElementById('findInput').value;
        const replaceText = document.getElementById('replaceInput').value;

        if (!findText) {
            showAlert('Digite o texto a ser substituído.', 'warning');
            return;
        }

        const regex = new RegExp(findText, 'g');
        textInput.value = textInput.value.replace(regex, replaceText);
        updateTextStats();
        showAlert('Substituição realizada.', 'success');
    }

    function copyText() {
        textInput.select();
        document.execCommand('copy');

        // Feedback visual
        const originalText = document.getElementById('copyTextBtn').innerHTML;
        document.getElementById('copyTextBtn').innerHTML = '<i class="fas fa-check me-2"></i>Copiado!';

        setTimeout(() => {
            document.getElementById('copyTextBtn').innerHTML = originalText;
        }, 2000);
    }

    function downloadText() {
        const text = textInput.value;
        if (!text) {
            showAlert('Nenhum texto para download.', 'warning');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'texto_analisado.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('Download iniciado.', 'success');
    }

    // Funções para leitura em voz alta
    function toggleSpeech() {
        if (synth.speaking && synth.paused) {
            synth.resume();
            readButton.innerHTML = '<i class="fas fa-pause me-2"></i>Pausar';
        } else if (synth.speaking) {
            synth.pause();
            readButton.innerHTML = '<i class="fas fa-play me-2"></i>Continuar';
        } else {
            const selection = window.getSelection();
            const selectedText = selection.toString();
            const textToRead = selectedText || textInput.value;

            if (textToRead.trim() === '') {
                showAlert('Nenhum texto para ler. Digite ou selecione um texto.', 'warning');
                return;
            }

            speak(textToRead);
        }
    }

    function speak(text) {
        if (synth.speaking) {
            synth.cancel();
        }

        utterance = new SpeechSynthesisUtterance(text);

        // Configura a voz selecionada
        const selectedOption = voiceSelect.selectedOptions[0];
        if (selectedOption) {
            const voices = synth.getVoices();
            const selectedVoice = voices.find(voice =>
                voice.name === selectedOption.getAttribute('data-name'));
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
        }

        // Eventos
        utterance.onstart = function () {
            readButton.innerHTML = '<i class="fas fa-pause me-2"></i>Pausar';
        };

        utterance.onend = function () {
            readButton.innerHTML = '<i class="fas fa-play me-2"></i>Ler';
        };

        utterance.onerror = function (event) {
            console.error('Erro na fala:', event);
            showAlert('Ocorreu um erro ao tentar ler o texto.', 'danger');
            readButton.innerHTML = '<i class="fas fa-play me-2"></i>Ler';
        };

        synth.speak(utterance);
    }

    function stopSpeech() {
        if (synth.speaking) {
            synth.cancel();
            readButton.innerHTML = '<i class="fas fa-play me-2"></i>Ler';
        }
    }

        // Funções para o tradutor
        async function translateText() {
            const text = textInput.value.trim();
            if (!text) {
                showAlert('Digite um texto para traduzir.', 'warning');
                return;
            }
    
            const sourceLang = sourceLanguage.value;
            const targetLang = targetLanguage.value;
    
            try {
                translateBtn.disabled = true;
                translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Traduzindo...';
    
                // Usando a API do MyMemory (alternativa ao LibreTranslate)
                const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang === 'auto' ? 'auto' : sourceLang}|${targetLang}`);
    
                if (!response.ok) {
                    throw new Error('Falha na tradução');
                }
    
                const data = await response.json();
    
                if (data.responseStatus !== 200 || !data.responseData) {
                    throw new Error(data.responseDetails || 'Erro na tradução');
                }
    
                translatedText.value = data.responseData.translatedText;
                showAlert('Texto traduzido com sucesso!', 'success');
            } catch (error) {
                console.error('Erro na tradução:', error);
                showAlert(error.message || 'Erro ao traduzir o texto. Tente novamente mais tarde.', 'danger');
            } finally {
                translateBtn.disabled = false;
                translateBtn.innerHTML = '<i class="fas fa-language me-2"></i>Traduzir Texto';
            }
        }
    
        function copyTranslation() {
            if (!translatedText.value) {
                showAlert('Nenhum texto traduzido para copiar.', 'warning');
                return;
            }
    
            translatedText.select();
            document.execCommand('copy');
    
            // Feedback visual
            const originalText = copyTranslationBtn.innerHTML;
            copyTranslationBtn.innerHTML = '<i class="fas fa-check me-1"></i>Copiado!';
    
            setTimeout(() => {
                copyTranslationBtn.innerHTML = originalText;
            }, 2000);
        }
    
        function toggleTranslationSpeech() {
            const text = translatedText.value.trim();
            if (!text) {
                showAlert('Nenhum texto traduzido para ouvir.', 'warning');
                return;
            }
    
            if (synth.speaking && synth.paused) {
                synth.resume();
                listenTranslationBtn.innerHTML = '<i class="fas fa-pause me-1"></i>Pausar';
            } else if (synth.speaking) {
                synth.pause();
                listenTranslationBtn.innerHTML = '<i class="fas fa-volume-up me-1"></i>Continuar';
            } else {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = targetLanguage.value;
    
                // Tenta encontrar uma voz no idioma de destino
                const voices = synth.getVoices();
                const targetVoice = voices.find(voice =>
                    voice.lang.startsWith(targetLanguage.value));
    
                if (targetVoice) {
                    utterance.voice = targetVoice;
                }
    
                utterance.onstart = function () {
                    listenTranslationBtn.innerHTML = '<i class="fas fa-pause me-1"></i>Pausar';
                };
    
                utterance.onend = function () {
                    listenTranslationBtn.innerHTML = '<i class="fas fa-volume-up me-1"></i>Ouvir';
                };
    
                utterance.onerror = function (event) {
                    console.error('Erro na fala:', event);
                    showAlert('Ocorreu um erro ao tentar ler a tradução.', 'danger');
                    listenTranslationBtn.innerHTML = '<i class="fas fa-volume-up me-1"></i>Ouvir';
                };
    
                synth.speak(utterance);
            }
        }
    
        function stopTranslation() {
            if (synth.speaking) {
                synth.cancel();
                listenTranslationBtn.innerHTML = '<i class="fas fa-volume-up me-1"></i>Ouvir';
            }
        }
    
        function swapLanguages() {
            const sourceValue = sourceLanguage.value;
            const targetValue = targetLanguage.value;
    
            // Não permite trocar se o source for "auto"
            if (sourceValue !== 'auto') {
                sourceLanguage.value = targetValue;
                targetLanguage.value = sourceValue;
            } else {
                showAlert('Não é possível trocar quando o idioma de origem é "Escolha o Idioma".', 'info');
            }
        }
    
        function clearTranslation() {
            translatedText.value = '';
            showAlert('Texto traduzido limpo com sucesso.', 'info');
        }
    
        // Função para mostrar alertas
        function showAlert(message, type) {
            // Remove alertas existentes
            const existingAlerts = document.querySelectorAll('.alert');
            existingAlerts.forEach(alert => alert.remove());
    
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.role = 'alert';
    
            alertDiv.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas ${getIconForType(type)} me-2"></i>
                    <div>${message}</div>
                    <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            `;
    
            document.body.appendChild(alertDiv);
    
            // Remove o alerta após 4 segundos
            setTimeout(() => {
                alertDiv.classList.remove('show');
                setTimeout(() => alertDiv.remove(), 150);
            }, 4000);
        }
    
        function getIconForType(type) {
            const icons = {
                'success': 'fa-check-circle',
                'danger': 'fa-exclamation-circle',
                'warning': 'fa-exclamation-triangle',
                'info': 'fa-info-circle'
            };
            return icons[type] || 'fa-info-circle';
        }
    });