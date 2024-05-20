// 蟷螂作
document.addEventListener('DOMContentLoaded', function() {
    var addPlayerButton = document.getElementById('addPlayerButton');
    var createBingoButton = document.getElementById('createBingoButton');
    var playerContainer = document.getElementById('player-container');
    var playerCount = 0;
    var maxPlayers = 6;

    addPlayerButton.addEventListener('click', function() {
        if (playerCount < maxPlayers) {
            playerCount++;
            var input = document.createElement('input');
            input.type = 'text';
            input.name = 'player' + playerCount;
            input.placeholder = 'プレイヤー名';
            playerContainer.appendChild(input);
        }
    });

    createBingoButton.addEventListener('click', function() {
        var playerNames = [];
        var inputs = playerContainer.querySelectorAll('input[type="text"]');
        inputs.forEach(function(input) {
            if (input.value.trim() !== '') {
                playerNames.push(input.value.trim());
            }
        });

        // プレイヤー名をシャッフルしてランダムにチームを分ける
        var shuffledPlayers = shuffleArray(playerNames);
        var half = Math.ceil(shuffledPlayers.length / 2);
        var leftTeam = shuffledPlayers.slice(0, half);
        var rightTeam = shuffledPlayers.slice(half);

        // ラジオボタンの選択値を取得して selectedMaxImageNumber を設定
        var selectedOption = document.querySelector('input[name="miiOption"]:checked').value;
        selectedMaxImageNumber = parseInt(selectedOption);

        var initialSeed = Math.floor(Math.random() * 4294967296);
        var leftResult = shuffle([...Array(selectedMaxImageNumber).keys()].map(i => `image${i + 1}.png`), initialSeed);
        var rightResult = shuffle([...Array(selectedMaxImageNumber).keys()].map(i => `image${i + 1}.png`), initialSeed + 1);

        var encodedPlayers = encodeURIComponent(JSON.stringify({ leftTeam, rightTeam }));
        window.location.href = `bingo.html?maxImageNumber=${selectedMaxImageNumber}&players=${encodedPlayers}&leftSeed=${initialSeed}&rightSeed=${initialSeed + 1}`;
    });

    var selectedMaxImageNumber = 86;
});

function shuffle(array, seed) {
    var a = 1664525;
    var c = 1013904223;
    var m = 4294967296;
    var result = array.slice();
    for (var i = result.length - 1; i > 0; i--) {
        seed = (a * seed + c) % m;
        var j = Math.floor(seed / m * (i + 1));
        var temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }
    return result;
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function displayTeams(teams) {
    var leftTeam = teams.leftTeam;
    var rightTeam = teams.rightTeam;

    var leftTeamContainer = document.getElementById('left-team');
    var rightTeamContainer = document.getElementById('right-team');

    leftTeamContainer.innerHTML = '<h3>左チーム</h3><ul>' + leftTeam.map(player => '<li>' + player + '</li>').join('') + '</ul>';
    rightTeamContainer.innerHTML = '<h3>右チーム</h3><ul>' + rightTeam.map(player => '<li>' + player + '</li>').join('') + '</ul>';
}

function updateColorsBasedOnVictory(winner) {
    var cellsLeft = document.querySelectorAll('#bingo-container-left .bingo-cell');
    var cellsRight = document.querySelectorAll('#bingo-container-right .bingo-cell');

    cellsLeft.forEach(function(cell) {
        if (cell.classList.contains('gray')) {
            cell.classList.remove('gray');
            cell.classList.add(winner === '1P' ? 'red' : 'blue');
        } else if (cell.classList.contains('blue')) {
            cell.classList.remove('blue');
            cell.classList.add('transparent'); // 青マスを透明にする
            cell.clickCount = 3 ; // 透明にした後のクリックカウントを2に設定
        }
    });

    cellsRight.forEach(function(cell) {
        if (cell.classList.contains('gray')) {
            cell.classList.remove('gray');
            cell.classList.add(winner === '3P' ? 'red' : 'blue');
        } else if (cell.classList.contains('blue')) {
            cell.classList.remove('blue');
            cell.classList.add('transparent'); // 青マスを透明にする
            cell.clickCount = 3; // 透明にした後のクリックカウントを2に設定
        }
    });
}

function generateBingo(containerId, imagePaths) {
    var container = document.getElementById(containerId);
    container.innerHTML = ''; // コンテナの中身をクリア

    // 画像をコンテナに追加
    for (var i = 0; i < 25; i++) {
        var cell = document.createElement('div');
        cell.className = 'bingo-cell';
        var img = document.createElement('img');
        img.src = imagePaths[i];
        img.alt = 'Bingo Image';
        cell.appendChild(img);
        container.appendChild(cell);
    }

    // クリックイベントを設定
    setupClickEvent(containerId);
}

function generateBothBingos(leftImagePaths, rightImagePaths) {
    generateBingo('bingo-container-left', leftImagePaths);
    generateBingo('bingo-container-right', rightImagePaths);
}

function setupClickEvent(containerId) {
    var cells = document.querySelectorAll('#' + containerId + ' .bingo-cell');
    cells.forEach(function(cell) {
        cell.clickCount = -1; // クリックカウントを初期化

        cell.addEventListener('click', function() {
            this.clickCount = (this.clickCount + 1) % 4; // 4つの状態をローテーション
            this.classList.remove('red', 'blue', 'transparent', 'gray'); // すべてのクラスを一旦削除

            if (this.clickCount === 0) { // グレー
                this.classList.add('gray');
            } else if (this.clickCount === 1) { // 赤
                this.classList.add('red');
            } else if (this.clickCount === 2) { // 青
                this.classList.add('blue');
            } else { // 透明（元に戻る）
                this.classList.add('transparent');
            }
        });
    });
}

var selectedMaxImageNumber = 86; // デフォルト値としてMiiありの86を設定

window.onload = function() {
    var params = new URLSearchParams(window.location.search);
    var maxImageNumber = parseInt(params.get('maxImageNumber'), 10);
    var players = JSON.parse(decodeURIComponent(params.get('players') || '[]'));
    var leftSeed = parseInt(params.get('leftSeed'), 10);
    var rightSeed = parseInt(params.get('rightSeed'), 10);

    // URLのパラメータからmaxImageNumberを取得してビンゴを生成
    if (!isNaN(maxImageNumber)) {
        selectedMaxImageNumber = maxImageNumber;
    }

    var leftImagePaths = shuffle([...Array(selectedMaxImageNumber).keys()].map(i => `images/image${i + 1}.png`), leftSeed);
    var rightImagePaths = shuffle([...Array(selectedMaxImageNumber).keys()].map(i => `images/image${i + 1}.png`), rightSeed);

    generateBothBingos(leftImagePaths.slice(0, 25), rightImagePaths.slice(0, 25)); // 両方のビンゴを生成
    displayTeams(players); // チームを表示

    var backButton = document.getElementById('backButton');
    backButton.addEventListener('click', function() {
        window.location.href = 'index.html';
    });

    var createBingoButton = document.getElementById('createBingoButton');
    createBingoButton.addEventListener('click', function() {
        var initialSeed = Math.floor(Math.random() * 4294967296);
        var leftResult = shuffle([...Array(selectedMaxImageNumber).keys()].map(i => `image${i + 1}.png`), initialSeed);
        var rightResult = shuffle([...Array(selectedMaxImageNumber).keys()].map(i => `image${i + 1}.png`), initialSeed + 1);

        // プレイヤー名をシャッフルしてランダムにチームを分ける
        var shuffledPlayers = shuffleArray(players.leftTeam.concat(players.rightTeam));
        var half = Math.ceil(shuffledPlayers.length / 2);
        var leftTeam = shuffledPlayers.slice(0, half);
        var rightTeam = shuffledPlayers.slice(half);

        var encodedPlayers = encodeURIComponent(JSON.stringify({ leftTeam, rightTeam }));
        window.location.href = `bingo.html?maxImageNumber=${selectedMaxImageNumber}&players=${encodedPlayers}&leftSeed=${initialSeed}&rightSeed=${initialSeed + 1}`;
    });
};
