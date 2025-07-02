/**
 * 用户数据接口
 */
export interface IUserData {
  name: string;
  invitationCode: string;
}

/**
 * 用户名记录器，用于收集和存储用户信息
 */
export class UsernameLogger {
  private readonly slideDuration: number;
  private readonly zIndex: bigint;
  private container: HTMLDivElement | null = null;
  private button: HTMLButtonElement | null = null;
  private nameInput: HTMLInputElement | null = null;
  private codeInput: HTMLInputElement | null = null;
  private submitButton: HTMLButtonElement | null = null;
  private isOpen = false;

  /**
   * 创建用户名记录器
   * @param zIndex 元素的z-index值
   * @param slideDuration 滑动动画持续时间（毫秒）
   */
  constructor(zIndex: bigint, slideDuration: number) {
    this.zIndex = zIndex;
    this.slideDuration = slideDuration;
    this.createUI();
  }

  /**
   * 创建用户界面元素
   */
  private createUI(): void {
    // 创建触发按钮 (修改位置)
    this.button = document.createElement('button');
    Object.assign(this.button.style, {
      position: 'fixed',
      left: '0',
      top: 'calc(50% - 50px)',
      width: '30px',
      height: '100px',
      backgroundColor: '#4a6fa5',
      color: 'white',
      border: 'none',
      borderRadius: '0 8px 8px 0',
      cursor: 'pointer',
      boxShadow: '2px 2px 10px rgba(0,0,0,0.2)',
      zIndex: this.zIndex.toString(),
      transition: `transform ${this.slideDuration}ms ease, background-color 0.3s ease`, // 添加背景色过渡
      transform: 'translateX(0)',
      fontSize: '18px', // 增大字体使箭头更明显
      fontWeight: 'bold'
    });
    this.button.textContent = '▶'; // 修改为三角箭头

    // 添加悬停效果
    this.button.addEventListener('mouseenter', () => {
      if (this.button) {
        this.button.style.backgroundColor = '#3a5a8a';
      }
    });
    this.button.addEventListener('mouseleave', () => {
      if (this.button) {
        this.button.style.backgroundColor = '#4a6fa5';
      }
    });

    this.button.addEventListener('click', () => this.toggleSlide());
    document.body.appendChild(this.button);

    // 创建滑动容器
    this.container = document.createElement('div');
    Object.assign(this.container.style, {
      position: 'fixed',
      left: '-350px',
      top: 'calc(50% - 150px)',
      width: '300px',
      height: '300px',
      backgroundColor: '#f5f7fa',
      boxShadow: '0 0 15px rgba(0,0,0,0.3)',
      borderRadius: '0 10px 10px 0',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: this.zIndex.toString(),
      transition: `left ${this.slideDuration}ms ease-out`
    });

    // 创建标题
    const title = document.createElement('h2');
    Object.assign(title.style, {
      margin: '0 0 20px 0',
      color: '#333',
      fontSize: '1.5em'
    });
    title.textContent = '用户信息';
    this.container.appendChild(title);

    // 创建姓名输入框
    const nameContainer = document.createElement('div');
    Object.assign(nameContainer.style, {
      marginBottom: '15px',
      width: '100%'
    });
    const nameLabel = document.createElement('label');
    Object.assign(nameLabel.style, {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#555'
    });
    nameLabel.textContent = '姓名';
    this.nameInput = document.createElement('input');
    Object.assign(this.nameInput.style, {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      boxSizing: 'border-box',
      fontSize: '1em'
    });
    this.nameInput.type = 'text';
    this.nameInput.placeholder = '输入您的姓名';
    nameContainer.appendChild(nameLabel);
    nameContainer.appendChild(this.nameInput);
    this.container.appendChild(nameContainer);

    // 创建邀请码输入框
    const codeContainer = document.createElement('div');
    Object.assign(codeContainer.style, {
      marginBottom: '25px',
      width: '100%'
    });
    const codeLabel = document.createElement('label');
    Object.assign(codeLabel.style, {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#555'
    });
    codeLabel.textContent = '邀请码';
    this.codeInput = document.createElement('input');
    Object.assign(this.codeInput.style, {
      width: '100%',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ddd',
      boxSizing: 'border-box',
      fontSize: '1em'
    });
    this.codeInput.type = 'text';
    this.codeInput.placeholder = '输入邀请码';
    codeContainer.appendChild(codeLabel);
    codeContainer.appendChild(this.codeInput);
    this.container.appendChild(codeContainer);

    // 创建提交按钮
    this.submitButton = document.createElement('button');
    Object.assign(this.submitButton.style, {
      padding: '12px 30px',
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      borderRadius: '50px',
      fontSize: '1.2em',
      cursor: 'pointer',
      transition: 'background-color 0.3s, transform 0.2s',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
    });
    this.submitButton.textContent = '👌';
    this.submitButton.addEventListener('click', () => this.saveUserData());
    this.submitButton.addEventListener('mousedown', () => {
      if (this.submitButton) {
        this.submitButton.style.transform = 'scale(0.95)';
      }
    });
    this.submitButton.addEventListener('mouseup', () => {
      if (this.submitButton) {
        this.submitButton.style.transform = 'scale(1)';
      }
    });
    this.submitButton.addEventListener('mouseleave', () => {
      if (this.submitButton) {
        this.submitButton.style.transform = 'scale(1)';
      }
    });
    this.container.appendChild(this.submitButton);

    // 添加输入事件监听器
    this.nameInput.addEventListener('input', () => this.validateInputs());
    this.codeInput.addEventListener('input', () => this.validateInputs());

    document.body.appendChild(this.container);
    this.loadInitialData();
  }

  /**
   * 加载初始用户数据
   */
  private loadInitialData(): void {
    const userData = this.getStoredUserData();
    if (userData) {
      if (this.nameInput) this.nameInput.value = userData.name;
      if (this.codeInput) this.codeInput.value = userData.invitationCode;
      this.enableSubmitButton(true);
    } else {
      this.enableSubmitButton(false);
    }
  }

  /**
   * 切换滑动面板状态
   */
  private toggleSlide(): void {
    if (!this.container || !this.button) return;
    
    this.isOpen = !this.isOpen;
    this.container.style.left = this.isOpen ? '0' : '-350px';

    if (this.isOpen) {
      this.button.textContent = "◀"
    } else {
      this.button.textContent = "▶"
    }
    
    // 更新按钮位置
    this.button.style.transform = this.isOpen 
      ? 'translateX(300px)' 
      : 'translateX(0)';
  }

  /**
   * 验证输入内容
   */
  private validateInputs(): void {
    const nameValid = this.nameInput?.value.trim() !== '';
    const codeValid = this.codeInput?.value.trim() !== '';
    this.enableSubmitButton(nameValid && codeValid);
  }

  /**
   * 设置提交按钮状态
   * @param enabled 是否启用按钮
   */
  private enableSubmitButton(enabled: boolean): void {
    if (!this.submitButton) return;
    
    this.submitButton.disabled = !enabled;
    this.submitButton.style.backgroundColor = enabled ? '#4CAF50' : '#cccccc';
    this.submitButton.style.cursor = enabled ? 'pointer' : 'not-allowed';
  }

  /**
   * 保存用户数据
   */
  private saveUserData(): void {
    if (!this.nameInput || !this.codeInput) return;
    
    const userData: IUserData = {
      name: this.nameInput.value.trim(),
      invitationCode: this.codeInput.value.trim()
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    this.toggleSlide();
  }

  /**
   * 尝试提示用户输入信息
   * @returns 如果弹出了输入面板则返回true，否则返回false
   */
  public tryPromptUser(): boolean {
    const hasData = this.getStoredUserData() !== null;
    if (!hasData && !this.isOpen) {
      this.toggleSlide();
      return true;
    }
    return false;
  }

  /**
   * 获取存储的用户数据
   * @returns 用户数据对象或null
   */
  private getStoredUserData(): IUserData | null {
    const data = localStorage.getItem('userData');
    return data ? JSON.parse(data) : null;
  }

  /**
   * 获取当前用户数据
   */
  public get userData(): IUserData | null {
    return this.getStoredUserData();
  }
}