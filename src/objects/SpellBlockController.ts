import { Event, TextBlockController } from "txs-phaser-core";
import { SpellBlock } from "./SpellBlock";

export class SpellBlockController extends TextBlockController<SpellBlock> {

  public readonly BlocksArranged = new Event<SpellBlockController, [ SpellBlock[] ]>();

  public arrangeBlocks(blocks: SpellBlock[], gap: number = 0, duration: number = 1000): void {
    this.setActive(false);
    const sortedBlocks = [...blocks].sort((a, b) => 
      a.arcadeBody.x - b.arcadeBody.x
    );

    // 1. 禁用物理
    sortedBlocks.forEach(block => {
      block.arcadeBody.enable = false;
      block.isHighlighted = false;
    });

    // 2. 计算总宽度和起始位置
    const centerX = 0;
    const centerY = 0;
    const totalWidth = sortedBlocks.reduce(
      (sum, block) => sum + block.width, 
      0
    ) + gap * (sortedBlocks.length - 1);
    
    const startX = centerX - totalWidth / 2;
    let currentX = startX;

    // 3. 创建并执行缓动
    const tweens = sortedBlocks.map(block => {
      const targetX = currentX + block.width / 2;
      currentX += block.width + gap;
      
      return this.scene.tweens.add({
        targets: block,
        x: targetX,
        y: centerY,
        duration: duration,
        ease: Phaser.Math.Easing.Cubic.Out
      });
    });

    // 4. 等待所有缓动完成后恢复物理
    Promise.all(tweens.map(t => new Promise(resolve => t.once('complete', resolve))))
      .then(() => {
        sortedBlocks.forEach(block => {
          // 恢复物理并重置速度
          block.arcadeBody.enable = true;
          block.arcadeBody.setVelocity(0, 0);
        });
        
        // 5. 触发事件并恢复交互
        this.setActive(true);
        this.BlocksArranged.invoke(this, sortedBlocks);
      });
  }
}