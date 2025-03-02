document.addEventListener("DOMContentLoaded", () => {
  const body = document.getElementsByTagName("body");
  const cells = document.querySelectorAll(".cell");
  const statusDisplay = document.getElementById("status");
  const restartButton = document.getElementById("restart");

  let board = ["", "", "", "", "", "", "", "", ""];
  let currentPlayer = "X";
  let gameActive = true;

  const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const handleCellClick = (event) => {
    const clickedCell = event.target;
    const cellIndex = parseInt(clickedCell.getAttribute("data-index"));

    // Ignora cliques se a célula já estiver preenchida ou se o jogo tiver terminado
    if (board[cellIndex] !== "" || !gameActive) {
      return;
    }

    updateCell(clickedCell, cellIndex);
    checkResult();
  };

  const updateCell = (cell, index) => {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
  };

  const swapPlayer = () => {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.textContent = `É a vez do jogador ${currentPlayer}`;
  };

  const checkResult = () => {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
      const condition = winningConditions[i];
      let a = board[condition[0]];
      let b = board[condition[1]];
      let c = board[condition[2]];
      if (a === "" || b === "" || c === "") {
        continue;
      }
      if (a === b && b === c) {
        roundWon = true;
        break;
      }
    }

    if (roundWon) {
      body[0].classList.add("vitoria");
      statusDisplay.textContent = `Jogador ${currentPlayer} venceu!`;
      let mySource; //Variavel global para podermos controlar o som
      loadSound('./assets/sounds/vitoria.mp3')
        .then(source => {
          mySource = source;
          mySource.start(0); // Inicia a reprodução imediatamente (0 segundos de atraso)
        });
      gameActive = false;
      return;
    }

    if (!board.includes("")) {
      statusDisplay.textContent = "Empate!";
      gameActive = false;
      let mySource; //Variavel global para podermos controlar o som
      loadSound('./assets/sounds/empate.mp3')
        .then(source => {
          mySource = source;
          mySource.start(0); // Inicia a reprodução imediatamente (0 segundos de atraso)
        });
      return;
    }

    swapPlayer();
  };

  const restartGame = () => {
    board = ["", "", "", "", "", "", "", "", ""];
    gameActive = true;
    currentPlayer = "X";
    body[0].classList.remove("vitoria");
    statusDisplay.textContent = `É a vez do jogador ${currentPlayer}`;
    cells.forEach((cell) => {
      cell.textContent = "";
    });
  };

  cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
  restartButton.addEventListener("click", restartGame);

  statusDisplay.textContent = `É a vez do jogador ${currentPlayer}`;
});

const audioContext = new (window.AudioContext || window.webkitAudioContext)(); // Compatibilidade com navegadores mais antigos

function loadSound(url) {
  return fetch(url) // Usa a API Fetch para buscar o arquivo
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.arrayBuffer(); // Obtém os dados binários do MP3
    })
    .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer)) // Decodifica os dados para um AudioBuffer
    .then(audioBuffer => {
      // Cria uma fonte de áudio
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer; // Define o AudioBuffer como a fonte
      source.connect(audioContext.destination); // Conecta a fonte ao destino (alto-falantes)
      return source;
    })
    .catch(error => {
      console.error("Erro ao carregar/decodificar o áudio:", error);
    });
}


// Exemplo de como pausar (note que a Web Audio API não tem um 'pause' direto para BufferSources)
// A maneira mais comum é desconectar e depois reconectar quando quiser retomar.
function pauseSound() {
  if (mySource) {
    mySource.disconnect();
  }
}

function resumeSound() {
  if (mySource) {
    loadSound('caminho/para/seu/arquivo.mp3') //Recarrega, mas é uma simplificação
      .then(source => {
        mySource = source;
        mySource.start(0); // Inicia a reprodução imediatamente (0 segundos de atraso)
      });
  }
}
