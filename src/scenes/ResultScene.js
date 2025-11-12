class ResultScene extends Phaser.Scene {
  constructor() {
    super({ key: "ResultScene" });
  }

  init(data) {
    this.scores = data.scores;
    this.totalScore = data.totalScore;
    this.partsData = data.partsData || {};
    this.faceX = data.faceX || 400;
    this.faceY = data.faceY || 300;
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // 배경
    this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0xf0e6d2
      )
      .setOrigin(0);

    // 왼쪽에 만든 얼굴 표시
    this.add.text(200, centerY - 200, '당신이 만든 얼굴', {
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#2c3e50',
    }).setOrigin(0.5).setAlpha(0.6);

    this.drawCreatedFace(200, centerY);

    // 제목
    const title = this.add.text(centerX, 50, "게임 결과", {
      fontSize: "38px",
      fontStyle: "bold",
      color: "#2c3e50",
    });
    title.setOrigin(0.5);
    title.setPadding(0, 10, 0, 10);

    // 총점 표시
    const avgScore = Math.floor(this.totalScore / 4);
    let grade = "";
    let gradeColor = "";

    if (avgScore >= 90) {
      grade = "S급";
      gradeColor = "#f1c40f";
    } else if (avgScore >= 80) {
      grade = "A급";
      gradeColor = "#27ae60";
    } else if (avgScore >= 70) {
      grade = "B급";
      gradeColor = "#3498db";
    } else if (avgScore >= 60) {
      grade = "C급";
      gradeColor = "#e67e22";
    } else {
      grade = "D급";
      gradeColor = "#e74c3c";
    }

    // 등급 표시
    this.add
      .text(centerX, 140, grade, {
        fontSize: "72px",
        fontStyle: "bold",
        color: gradeColor,
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    // 총점
    this.add
      .text(centerX, 220, `총점: ${this.totalScore}점 / 400점`, {
        fontSize: "28px",
        fontStyle: "bold",
        color: "#2c3e50",
      })
      .setOrigin(0.5);

    // 평균 점수
    this.add
      .text(centerX, 260, `평균: ${avgScore}점`, {
        fontSize: "24px",
        color: "#555",
      })
      .setOrigin(0.5);

    // 구분선
    // this.add.rectangle(centerX, 310, 400, 2, 0xbdc3c7).setOrigin(0.5);

    // 개별 점수 표시
    const partNames = {
      leftEye: "왼쪽 눈",
      rightEye: "오른쪽 눈",
      nose: "코",
      mouth: "입",
    };

    let yPos = 340;
    Object.keys(this.scores).forEach((partType) => {
      const score = this.scores[partType];
      const name = partNames[partType];

      // 파트 이름
      this.add
        .text(centerX - 150, yPos, name, {
          fontSize: "20px",
          color: "#2c3e50",
        })
        .setOrigin(0, 0.5);

      // 점수
      const scoreColor =
        score >= 90
          ? "#27ae60"
          : score >= 70
          ? "#f39c12"
          : score >= 50
          ? "#e67e22"
          : "#e74c3c";
      this.add
        .text(centerX + 150, yPos, `${score}점`, {
          fontSize: "20px",
          fontStyle: "bold",
          color: scoreColor,
        })
        .setOrigin(1, 0.5);

      yPos += 35;
    });

    // 다시하기 버튼
    const retryButton = this.add.rectangle(
      centerX - 110,
      centerY + 220,
      180,
      55,
      0x3498db
    );
    retryButton.setStrokeStyle(3, 0x2980b9);
    retryButton.setInteractive({ useHandCursor: true });

    const retryText = this.add
      .text(centerX - 110, centerY + 220, "다시하기", {
        fontSize: "24px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // 처음으로 버튼
    const homeButton = this.add.rectangle(
      centerX + 110,
      centerY + 220,
      180,
      55,
      0x95a5a6
    );
    homeButton.setStrokeStyle(3, 0x7f8c8d);
    homeButton.setInteractive({ useHandCursor: true });

    const homeText = this.add
      .text(centerX + 110, centerY + 220, "처음으로", {
        fontSize: "24px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // 버튼 호버 효과
    retryButton.on("pointerover", () => {
      retryButton.setFillStyle(0x2980b9);
    });

    retryButton.on("pointerout", () => {
      retryButton.setFillStyle(0x3498db);
    });

    homeButton.on("pointerover", () => {
      homeButton.setFillStyle(0x7f8c8d);
    });

    homeButton.on("pointerout", () => {
      homeButton.setFillStyle(0x95a5a6);
    });

    // 버튼 클릭 이벤트
    retryButton.on("pointerdown", () => {
      this.scene.start("GameScene");
    });

    homeButton.on("pointerdown", () => {
      this.scene.start("StartScene");
    });

    // 키보드 단축키 (기존 리스너 제거 후 등록)
    this.input.keyboard.off("keydown-SPACE");
    this.input.keyboard.off("keydown-ESC");

    this.input.keyboard.on("keydown-SPACE", () => {
      this.scene.start("GameScene");
    });

    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.start("StartScene");
    });
  }

  drawCreatedFace(x, y) {
    // 4판: 귀 추가 (얼굴 윤곽보다 먼저 그려서 뒤에 배치)
    if (gameCount > 4) {
      this.add.ellipse(x - 115, y, 30, 50, 0xffd4a3);
      this.add.ellipse(x - 115, y, 30, 50).setStrokeStyle(3, 0x000000);
      this.add.ellipse(x + 115, y, 30, 50, 0xffd4a3);
      this.add.ellipse(x + 115, y, 30, 50).setStrokeStyle(3, 0x000000);
    }

    // 2판: 머리카락 추가
    if (gameCount > 2) {
      this.add.circle(x - 80, y - 90, 18, 0x654321);
      this.add.circle(x - 40, y - 110, 22, 0x654321);
      this.add.circle(x, y - 120, 25, 0x654321);
      this.add.circle(x + 40, y - 110, 22, 0x654321);
      this.add.circle(x + 80, y - 90, 18, 0x654321);
    }

    // 1판: 얼굴 윤곽
    const face = this.add.circle(x, y, 120, 0xffd4a3);
    face.setStrokeStyle(4, 0x000000);

    // 3판: 볼터치 추가
    if (gameCount > 3) {
      this.add.circle(x - 70, y + 15, 20, 0xff9999, 0.6);
      this.add.circle(x + 70, y + 15, 20, 0xff9999, 0.6);
    }

    // 고정된 파츠들을 그리기
    Object.keys(this.partsData).forEach((partType) => {
      const partData = this.partsData[partType];
      // GameScene의 좌표를 결과 화면의 얼굴 중심 기준으로 변환
      const offsetX = partData.x - this.faceX;
      const offsetY = partData.y - this.faceY;
      const newX = x + offsetX;
      const newY = y + offsetY;

      this.createPartVisual(partType, newX, newY);
    });
  }

  createPartVisual(type, x, y) {
    let part;

    switch (type) {
      case "leftEye":
      case "rightEye":
        // 눈: 원형
        const eyeBall = this.add.circle(x, y, 15, 0xffffff);
        eyeBall.setStrokeStyle(2, 0x000000);
        eyeBall.setAlpha(0.3);
        const pupil = this.add.circle(x, y, 6, 0x000000);
        pupil.setAlpha(0.3);
        break;

      case "nose":
        // 코: 삼각형
        const nose = this.add.triangle(x, y, 0, -15, -10, 15, 10, 15, 0xffc4a3);
        nose.setStrokeStyle(2, 0x000000);
        nose.setAlpha(0.3);
        break;

      case "mouth":
        // 입: 호
        const mouth = this.add.arc(x, y, 40, 0, 180, false, 0xff6b6b);
        mouth.setStrokeStyle(3, 0x000000);
        mouth.setAlpha(0.3);
        break;
    }
  }
}
