class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // 배경
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0xf0e6d2).setOrigin(0);

        // 제목
        const title = this.add.text(centerX, 70, '눈코입 맞추기', {
            fontSize: '44px',
            fontStyle: 'bold',
            color: '#2c3e50'
        });
        title.setOrigin(0.5);
        title.setPadding(0, 10, 0, 10);

        // 얼굴 윤곽 그리기
        const faceX = centerX;
        const faceY = centerY;
        const faceRadius = 120;

        // 얼굴 원
        const face = this.add.circle(faceX, faceY, faceRadius, 0xffd4a3);
        face.setStrokeStyle(4, 0x000000);

        // 게임 설명
        this.add.text(centerX, centerY + 180, '스페이스바를 눌러 떨어지는\n눈, 코, 입을 정확한 위치에 맞추세요!', {
            fontSize: '20px',
            color: '#555',
            align: 'center'
        }).setOrigin(0.5);

        // 시작 버튼
        const startButton = this.add.rectangle(centerX, centerY + 260, 200, 60, 0x3498db);
        startButton.setStrokeStyle(3, 0x2980b9);
        startButton.setInteractive({ useHandCursor: true });

        const startText = this.add.text(centerX, centerY + 260, '시작하기', {
            fontSize: '28px',
            fontStyle: 'bold',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 버튼 호버 효과
        startButton.on('pointerover', () => {
            startButton.setFillStyle(0x2980b9);
        });

        startButton.on('pointerout', () => {
            startButton.setFillStyle(0x3498db);
        });

        // 버튼 클릭
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // 스페이스바로도 시작 가능 (기존 리스너 제거 후 등록)
        this.input.keyboard.off('keydown-SPACE');
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('GameScene');
        });
    }
}
