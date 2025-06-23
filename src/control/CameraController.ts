import { TextBlock } from "../objects/TextBlock";

const MIN_ZOOM: number = 0.5;
const MAX_ZOOM: number = 1.5;
const ZOOM_STEP: number = 0.05;

export class CameraController extends Phaser.GameObjects.GameObject {

  private camera: Phaser.Cameras.Scene2D.Camera;
  private targetZoom: number;
  private targetPosition: Phaser.Geom.Point;

  /**
   * 創建一個{@link CameraController}個例。
   * @param scene 場景
   */
  constructor(scene: Phaser.Scene) {
    super(scene, "CameraController");
    this.camera = scene.cameras.main;
    this.targetZoom = 1;
    this.targetPosition = new Phaser.Geom.Point(0, 0);
    this.init();
    this.setupEvents();
  }
  
  private init(): void {
    const { x, y, width, height } = this.scene.physics.world.bounds;
    this.camera.setBounds(x, y, width, height);
    this.camera.centerOn(0, 0);
    // this.camera.setZoom(0.5, 0.5);
  }

  private setupEvents(): void {
    const Events = Phaser.Input.Events;
    const input = this.scene.input;
    input.on(Events.POINTER_WHEEL, this.onWheel.bind(this));
    //input.on(Events.GAMEOBJECT_DOWN, this.onDown.bind(this));
    //input.on(Events.DRAG_START, this.onDragStart.bind(this));
    //input.on(Events.DRAG, this.onDrag.bind(this));
    //input.on(Events.DRAG_END, this.onDragEnd.bind(this));
    //input.on(Events.GAMEOBJECT_UP, this.onUp.bind(this));
  }

  public zoomToIncludeAll(textBlocks: TextBlock[]): void {
    
  }

  private onWheel(
    pointer: Phaser.Input.Pointer,
    currentlyOver: Array<Phaser.GameObjects.GameObject>,
    deltaX: number,
    deltaY: number,
    deltaZ: number
  ): void {
    console.log(`onWheel: ${deltaX}, ${deltaY}, ${deltaZ}`);
    let zoom = this.camera.zoom;
    if (deltaY > 0)
      zoom -= ZOOM_STEP;
    else
      zoom += ZOOM_STEP;
    this.targetZoom = (Phaser.Math.Clamp(zoom, MIN_ZOOM, MAX_ZOOM));
    this.targetPosition.setTo(pointer.worldX, pointer.worldY);
  }

  public update(time: number, delta: number): void {
    this.updateZoom(this.camera, this.targetZoom);
    this.updatePosition(this.camera, this.targetPosition);
  }

  private updateZoom(camera: Phaser.Cameras.Scene2D.Camera, targetZoom: number): void {
    const currentZoom = camera.zoom;
    const diff = targetZoom - currentZoom;
    const crawl = diff / 2;
    camera.setZoom(currentZoom + crawl);
  }

  private updatePosition(camera: Phaser.Cameras.Scene2D.Camera, targetPosition: Phaser.Geom.Point): void {
    let { x, y } = camera;
    const { x: tx, y: ty } = targetPosition;
    x += (tx - x) * 0.5;
    y += (ty - y) * 0.5;
    camera.centerOn(x, y);
  }

}