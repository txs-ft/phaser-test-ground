import Phaser from 'phaser';
import SpellGroundMain from './scenes/SpellGroundMain';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(25,25,25,50)',
  scene: [
    SpellGroundMain
  ],
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { x: 0, y: 3136 },
      gravity: { x: 0, y: 0 }//,
      //debug: true,
      //debugShowBody: false,
      //debugShowVelocity: false
    }
  },
  //transparent: true
};

const game = new Phaser.Game(config);
game.canvas.style.position = "absolute",
game.canvas.style.zIndex = "100";

// 添加关闭按钮的提示框
function showWeChatWarning() {
  const warningId = 'wechat-warning';
  
  if (document.getElementById(warningId)) return;
  
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div id="${warningId}" style="position:fixed; top:0; left:0; right:0; background:#fff8e1; padding:12px; border-bottom:1px solid #ffd54f; z-index:9999; display:flex; align-items:center; justify-content:center;">
      <div style="flex:1; text-align:center; color:#333;">
        ⚠️ 微信浏览器限制导致发音功能不可用，请在浏览器打开！
      </div>
      <button style="background:#ffca28; border:none; padding:5px 10px; border-radius:4px; cursor:pointer">
        我知道了
      </button>
    </div>
  `;
  
  document.body.prepend(wrapper);
  wrapper.querySelector('button')!.addEventListener('click', () => {
    wrapper.style.display = 'none';
  });
}

// 检测是否为微信浏览器
function isWeChatBrowser() {
  // 微信浏览器的 User Agent 中包含 "MicroMessenger"
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('micromessenger') !== -1;
}

// 页面加载后执行检测
document.addEventListener('DOMContentLoaded', () => {
  if (isWeChatBrowser()) showWeChatWarning();
});

/*function logStuff(): void {
  const q = btoa("base|cube|index|power|root");
  console.log(q);
}

logStuff();*/

