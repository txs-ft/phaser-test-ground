class DraftGroundInputValidator {
    private readonly MAX_PART_LENGTH = 50;
    private createBtn: HTMLButtonElement;
    private textArea: HTMLTextAreaElement;

    constructor(createBtn: HTMLButtonElement, textArea: HTMLTextAreaElement) {
        this.createBtn = createBtn;
        this.textArea = textArea;
        
        // 初始验证
        this.validateAndUpdate();
        
        // 添加输入事件监听
        this.textArea.addEventListener('input', this.handleInput);
    }

    private handleInput = () => {
        this.validateAndUpdate();
    }

    private validateAndUpdate(): void {
        const isValid = this.validateInput(this.textArea.value);
        this.createBtn.disabled = !isValid;
        this.textArea.style.borderColor = isValid ? 'green' : 'red';
    }
    
    private readonly checkLength = (part: string) => part.length <= this.MAX_PART_LENGTH;

    private validateInput(value: string): boolean {
        // 检查是否包含至少一个分隔符
        if (!value.includes('|')) {
            return false;
        }
        // 長度不能為0
        if (value.length === 0)
          return false;
        // 第一個和最後一個字符一能為|
        if (value.charAt(0) === '|' || value.charAt(value.length - 1) == '|')
          return false;

        // 分割字符串并检查每部分长度
        const parts = value.split('|');
        return parts.every(this.checkLength);
    }

    public destroy(): void {
        this.textArea.removeEventListener('input', this.handleInput);
    }
}

export default DraftGroundInputValidator;