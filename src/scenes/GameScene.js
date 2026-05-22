class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  init() {
    // 정답 위치 (상대적 위치)
    this.targetPositions = {
      leftEye: { x: -40, y: -30 }, // 왼쪽 눈
      rightEye: { x: 40, y: -30 }, // 오른쪽 눈
      nose: { x: 0, y: 10 }, // 코
      mouth: { x: 0, y: 40 }, // 입
    };

    this.currentPartIndex = 0;
    this.parts = ["leftEye", "rightEye", "nose", "mouth"];
    this.partNames = {
      leftEye: "왼쪽 눈",
      rightEye: "오른쪽 눈",
      nose: "코",
      mouth: "입",
    };
    this.scores = {};
    this.totalScore = 0;
    this.fallingPart = null;
    this.isFixed = false;
    this.fixedParts = [];
    this.faceElements = []; // 얼굴 요소들을 담을 배열
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    this.faceX = centerX;
    this.faceY = centerY;
    do { this.eyeStyle = Phaser.Math.Between(0, 3); } while (this.eyeStyle === prevEyeStyle);
    prevEyeStyle = this.eyeStyle;
    do { this.noseStyle = Phaser.Math.Between(0, 2); } while (this.noseStyle === prevNoseStyle);
    prevNoseStyle = this.noseStyle;
    do { this.mouthStyle = Phaser.Math.Between(0, 3); } while (this.mouthStyle === prevMouthStyle);
    prevMouthStyle = this.mouthStyle;

    // 배경
    this.add
      .rectangle(
        0,
        0,
        this.cameras.main.width,
        this.cameras.main.height,
        0xf0e6d2,
      )
      .setOrigin(0);

    // 라운드별로 얼굴 부분 단계적으로 그리기
    this.drawFaceByRound();

    // 상단 정보 표시
    this.infoText = this.add
      .text(centerX, 40, "", {
        fontSize: "24px",
        fontStyle: "bold",
        color: "#2c3e50",
      })
      .setOrigin(0.5);

    // 스페이스바 안내
    this.spaceText = this.add
      .text(centerX, this.cameras.main.height - 40, "스페이스바를 눌러 고정!", {
        fontSize: "20px",
        color: "#e74c3c",
      })
      .setOrigin(0.5);

    // 스페이스바 입력 처리 (기존 리스너 제거 후 등록)
    this.input.keyboard.off("keydown-SPACE");
    this.input.keyboard.on("keydown-SPACE", () => {
      this.fixPart();
    });

    // 첫 번째 파츠 떨어뜨리기
    this.dropNextPart();
  }

  drawFaceByRound() {
    // 기존 얼굴 요소들 제거
    this.faceElements.forEach((element) => element.destroy());
    this.faceElements = [];

    // 4판: 귀 추가 (얼굴 뒤에 배치하기 위해 먼저 그림)
    if (gameCount > 3) {
      this.faceElements.push(
        this.add.ellipse(this.faceX - 115, this.faceY, 30, 50, 0xffd4a3),
      );
      this.faceElements.push(
        this.add
          .ellipse(this.faceX - 115, this.faceY, 30, 50)
          .setStrokeStyle(3, 0x000000),
      );
      this.faceElements.push(
        this.add.ellipse(this.faceX + 115, this.faceY, 30, 50, 0xffd4a3),
      );
      this.faceElements.push(
        this.add
          .ellipse(this.faceX + 115, this.faceY, 30, 50)
          .setStrokeStyle(3, 0x000000),
      );
    }

    // 2판: 머리카락 추가
    if (gameCount > 1) {
      this.faceElements.push(
        this.add.circle(this.faceX - 80, this.faceY - 90, 18, 0x654321),
      );
      this.faceElements.push(
        this.add.circle(this.faceX - 40, this.faceY - 110, 22, 0x654321),
      );
      this.faceElements.push(
        this.add.circle(this.faceX, this.faceY - 120, 25, 0x654321),
      );
      this.faceElements.push(
        this.add.circle(this.faceX + 40, this.faceY - 110, 22, 0x654321),
      );
      this.faceElements.push(
        this.add.circle(this.faceX + 80, this.faceY - 90, 18, 0x654321),
      );
    }

    // 1판: 얼굴 윤곽
    const face = this.add.circle(this.faceX, this.faceY, 120, 0xffd4a3);
    face.setStrokeStyle(4, 0x000000);
    this.faceElements.push(face);

    // 3판: 볼터치 추가
    if (gameCount > 2) {
      this.faceElements.push(
        this.add.circle(this.faceX - 70, this.faceY + 15, 20, 0xff9999, 0.6),
      );
      this.faceElements.push(
        this.add.circle(this.faceX + 70, this.faceY + 15, 20, 0xff9999, 0.6),
      );
    }
  }

  dropNextPart() {
    if (this.currentPartIndex >= this.parts.length) {
      // 모든 파츠 완료
      this.gameOver();
      return;
    }

    this.isFixed = false;
    const partType = this.parts[this.currentPartIndex];
    const partName = this.partNames[partType];

    this.infoText.setText(`${partName} (${this.currentPartIndex + 1}/4)`);

    const speed = Phaser.Math.Between(300, 900);

    // 파츠별 X 시작 위치 (왼쪽 눈과 오른쪽 눈은 해당 위치에서 떨어짐)
    let startX = this.faceX;
    if (partType === "leftEye") {
      startX = this.faceX - 40; // 왼쪽 눈 위치
    } else if (partType === "rightEye") {
      startX = this.faceX + 40; // 오른쪽 눈 위치
    }

    // 파츠 생성
    this.fallingPart = this.createPart(partType, startX, -50);

    // 첫 게임은 모든 파츠가 쉽게 (패턴 0), 재시작 후에는 모든 파츠 랜덤 패턴
    const pattern =
      gameCount === 1 ? 0 : gameCount === 2 ? 1 : Phaser.Math.Between(2, 5);
    console.log(
      "[GameScene] dropNextPart - gameCount:",
      gameCount,
      "/ pattern:",
      pattern,
      "/ part:",
      partType,
    );
    const duration = ((this.cameras.main.height + 100) / speed) * 1000;

    // 기본 Y축 떨어지기
    this.tweens.add({
      targets: this.fallingPart,
      y: this.cameras.main.height + 50,
      duration: duration,
      ease: "Linear",
      onComplete: () => {
        if (!this.isFixed) {
          this.fixPart();
        }
      },
    });

    // 추가 움직임
    switch (pattern) {
      case 0: // 첫 번째: 기본 낙하 (추가 움직임 없음)
        break;
      case 1: // 왼쪽에서 오른쪽으로 날아오기 (Y축 고정)
        // 파츠별 Y 위치 설정
        let targetY;
        if (partType === "leftEye" || partType === "rightEye") {
          targetY = this.faceY - 30;
        } else if (partType === "nose") {
          targetY = this.faceY + 10;
        } else {
          targetY = this.faceY + 40;
        }

        // 왼쪽에서 시작
        this.fallingPart.x = -50;
        this.fallingPart.y = targetY;

        // 기존 Y축 트윈 제거하고 X축 트윈으로 대체
        this.tweens.killTweensOf(this.fallingPart);

        this.tweens.add({
          targets: this.fallingPart,
          x: this.cameras.main.width + 50,
          duration: duration,
          ease: "Linear",
          onComplete: () => {
            if (!this.isFixed) {
              this.fixPart();
            }
          },
        });
        break;
      case 2: // 아래에서 위로 올라오기
        this.fallingPart.y = this.cameras.main.height + 50;
        this.tweens.killTweensOf(this.fallingPart);
        this.tweens.add({
          targets: this.fallingPart,
          y: -50,
          duration: duration,
          ease: "Linear",
          onComplete: () => {
            if (!this.isFixed) {
              this.fixPart();
            }
          },
        });
        break;
    }
  }

  createPart(type, x, y) {
    const part = this.add.container(x, y);

    switch (type) {
      case "leftEye":
      case "rightEye": {
        const eg = this.add.graphics();
        if (this.eyeStyle === 0) {
          // 동그란 눈
          const eyeBall = this.add.circle(0, 0, 15, 0xffffff);
          eyeBall.setStrokeStyle(2, 0x000000);
          const pupil = this.add.circle(0, 0, 6, 0x000000);
          part.add([eyeBall, pupil]);
        } else if (this.eyeStyle === 1) {
          // 네모 눈
          const eyeWhite = this.add.rectangle(0, 0, 28, 18, 0xffffff);
          eyeWhite.setStrokeStyle(2, 0x000000);
          const eyePupil = this.add.rectangle(3, 0, 8, 8, 0x000000);
          part.add([eyeWhite, eyePupil]);
        } else if (this.eyeStyle === 2) {
          // 실눈 (--)
          eg.lineStyle(5, 0x000000, 1);
          eg.beginPath();
          eg.moveTo(-13, 0);
          eg.lineTo(13, 0);
          eg.strokePath();
          part.add(eg);
        } else {
          // 반달 눈 (^)
          eg.lineStyle(4, 0x000000, 1);
          eg.beginPath();
          eg.arc(0, 5, 12, Math.PI, 0, true);
          eg.strokePath();
          part.add(eg);
        }
        break;
      }

      case "nose": {
        const ng = this.add.graphics();
        if (this.noseStyle === 0) {
          // 삼각형 코
          ng.fillStyle(0xffc4a3, 1);
          ng.lineStyle(2, 0x000000, 1);
          ng.fillTriangle(-10, 15, 10, 15, 0, -15);
          ng.strokeTriangle(-10, 15, 10, 15, 0, -15);
          part.add(ng);
        } else if (this.noseStyle === 1) {
          // 버튼 코
          const noseBody = this.add.circle(0, 0, 12, 0xffb4a3);
          noseBody.setStrokeStyle(2, 0x000000);
          const nostrilL = this.add.circle(-4, 4, 3, 0x000000);
          const nostrilR = this.add.circle(4, 4, 3, 0x000000);
          part.add([noseBody, nostrilL, nostrilR]);
        } else {
          // 긴 뾰족코
          ng.fillStyle(0xffc4a3, 1);
          ng.lineStyle(2, 0x000000, 1);
          ng.fillTriangle(-7, -8, 7, -8, 0, 22);
          ng.strokeTriangle(-7, -8, 7, -8, 0, 22);
          part.add(ng);
        }
        break;
      }

      case "mouth": {
        const mg = this.add.graphics();
        if (this.mouthStyle === 0) {
          // 호 입
          const mouth = this.add.arc(0, 0, 40, 0, 180, false, 0xff6b6b);
          mouth.setStrokeStyle(3, 0x000000);
          part.add(mouth);
        } else if (this.mouthStyle === 1) {
          // 세모 입 (Graphics로 중앙 정렬)
          mg.fillStyle(0xff4444, 1);
          mg.lineStyle(3, 0x000000, 1);
          mg.fillTriangle(-22, -12, 22, -12, 0, 14);
          mg.strokeTriangle(-22, -12, 22, -12, 0, 14);
          part.add(mg);
        } else if (this.mouthStyle === 2) {
          // 타원 입
          const mouth = this.add.ellipse(0, 0, 50, 28, 0xff3333);
          mouth.setStrokeStyle(3, 0x000000);
          part.add(mouth);
        } else {
          // 고양이 입 (w 모양)
          mg.lineStyle(4, 0x000000, 1);
          mg.beginPath();
          mg.moveTo(-18, -2);
          mg.lineTo(-5, 10);
          mg.strokePath();
          mg.beginPath();
          mg.moveTo(18, -2);
          mg.lineTo(5, 10);
          mg.strokePath();
          mg.beginPath();
          mg.arc(0, 10, 5, Math.PI, 0, true);
          mg.strokePath();
          part.add(mg);
        }
        break;
      }
    }

    part.partType = type;
    return part;
  }

  fixPart() {
    if (!this.fallingPart || this.isFixed) return;

    this.isFixed = true;

    // 트윈 중지
    this.tweens.killTweensOf(this.fallingPart);

    // 점수 계산 (X축, Y축 모두 고려)
    const partType = this.fallingPart.partType;
    const targetPos = this.targetPositions[partType];
    const targetX = this.faceX + targetPos.x;
    const targetY = this.faceY + targetPos.y;
    const currentX = this.fallingPart.x;
    const currentY = this.fallingPart.y;

    // 유클리드 거리 계산 (X, Y 모두 고려)
    const distanceX = targetX - currentX;
    const distanceY = targetY - currentY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // 거리 기반 점수 (최대 100점, 거리에 따라 감점)
    let score = Math.max(0, 100 - Math.floor(distance * 2));
    this.scores[partType] = score;
    this.totalScore += score;

    // 고정된 파츠 저장
    this.fixedParts.push(this.fallingPart);

    // 피드백 표시
    const feedback =
      score >= 90
        ? "완벽!"
        : score >= 70
          ? "좋아요!"
          : score >= 50
            ? "괜찮아요"
            : "아쉬워요";
    const feedbackColor =
      score >= 90
        ? "#27ae60"
        : score >= 70
          ? "#f39c12"
          : score >= 50
            ? "#e67e22"
            : "#e74c3c";

    const feedbackText = this.add
      .text(
        this.fallingPart.x + 80,
        this.fallingPart.y,
        `${feedback} (${score}점)`,
        {
          fontSize: "20px",
          fontStyle: "bold",
          color: feedbackColor,
        },
      )
      .setOrigin(0, 0.5);

    // 피드백 페이드아웃
    this.tweens.add({
      targets: feedbackText,
      alpha: 0,
      y: feedbackText.y - 30,
      duration: 1000,
      ease: "Power2",
      onComplete: () => {
        feedbackText.destroy();
      },
    });

    // 다음 파츠
    this.currentPartIndex++;
    this.time.delayedCall(1000, () => {
      this.dropNextPart();
    });
  }

  gameOver() {
    this.spaceText.setVisible(false);

    // 게임 판수 증가
    gameCount++;
    console.log("[GameScene] gameOver - gameCount 증가:", gameCount);

    // 고정된 파츠들의 위치 정보 수집
    const partsData = {};
    this.fixedParts.forEach((part) => {
      partsData[part.partType] = {
        x: part.x,
        y: part.y,
      };
    });

    // 결과 화면으로 전환
    this.time.delayedCall(1000, () => {
      this.scene.start("ResultScene", {
        scores: this.scores,
        totalScore: this.totalScore,
        partsData: partsData,
        faceX: this.faceX,
        faceY: this.faceY,
        eyeStyle: this.eyeStyle,
        noseStyle: this.noseStyle,
        mouthStyle: this.mouthStyle,
      });
    });
  }
}
