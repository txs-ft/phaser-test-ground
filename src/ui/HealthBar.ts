class HealthBar {
  private container: HTMLDivElement;
  private hearts: HTMLSpanElement[] = [];
  private _maxHp: bigint;
  private _hp: bigint;

  constructor(maxHp: bigint, zIndex: bigint) {
    this._maxHp = maxHp;
    this._hp = maxHp;
    
    // 创建容器
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: fixed;
      left: 10px;
      bottom: 10px;
      z-index: ${zIndex};
      pointer-events: none;
      font-size: 24px;
      line-height: 1;
      user-select: none;
      opacity: 0.9;
    `;
    
    // 初始化心形
    this.refreshHearts();
    // 添加初始内容
    this.updateHearts();
    document.body.appendChild(this.container);
  }

  set hp(hpLeft: bigint) {
    if (hpLeft < 0) throw new Error("HP cannot be negative");
    this._hp = hpLeft;
    this.updateHearts();
  }

  set maxHp(max: bigint) {
    this._maxHp = max;
    this.refreshHearts();
    this.updateHearts();
  }

  private refreshHearts() {
    const currentCount = this.hearts.length;
    const maxCount = Number(this._maxHp);

    // 添加缺失的心形
    if (maxCount > currentCount) {
      for (let i = currentCount; i < maxCount; i++) {
        const heart = document.createElement('span');
        this.container.appendChild(heart);
        this.hearts.push(heart);
      }
    }
    // 移除多余的心形
    else if (maxCount < currentCount) {
      for (let i = currentCount - 1; i >= maxCount; i--) {
        this.container.removeChild(this.hearts[i]);
        this.hearts.pop();
      }
    }
  }

  private updateHearts() {
    const hpNum = Number(this._hp);
    this.hearts.forEach((heart, index) => {
      heart.textContent = index < hpNum ? '🧡' : '🖤';
    });
  }

  // 清理方法（可选）
  public destroy() {
    document.body.removeChild(this.container);
    this.hearts = [];
  }
}

export default HealthBar;