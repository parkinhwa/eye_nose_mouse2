// 게임 판수 추적 (1판부터 시작)
let gameCount = 1;

// Phaser 게임 설정
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#f0e6d2',
    scene: [StartScene, GameScene, ResultScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

// 게임 인스턴스 생성
const game = new Phaser.Game(config);
