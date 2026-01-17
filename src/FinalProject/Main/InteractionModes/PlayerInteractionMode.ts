import {
    ADOMPointerMoveInteraction, ADragInteraction,
    AInteractionEvent, AKeyboardInteraction,
    ASerializable,
    Vec2, Vec3,
    AWheelInteraction,
    NodeTransform3D,
    GetAppState
} from "../../../anigraph";
import { ABasicSceneController } from "../../../anigraph/starter";
import type { HasInteractionModeCallbacks } from "../../../anigraph"
import { MainAppInteractionMode } from "./MainAppInteractionMode";
import { PlayerCamera } from "../Nodes/PlayerCamera";
import { MainSceneModel, TERRAFORM_STRENGTH_SLIDER } from "../MainSceneModel";
import { LowPolyTerrainView } from "../Nodes/LowPolyTerrain";
import * as THREE from "three";
import { TerrainCursorModel } from "../Nodes/TerrainCursor";
import { Mode } from "../Nodes/Mode";

@ASerializable("PlayerInteractionMode")
export class PlayerInteractionMode extends MainAppInteractionMode {
    playerCam!: PlayerCamera;
    raycaster: THREE.Raycaster = new THREE.Raycaster();

    cursor!: TerrainCursorModel;
    cursorRadius: number = 1.0;
    minCursorRadius: number = 0.2;
    maxCursorRadius: number = 5.0;
    cursorRadiusScrollSpeed: number = 0.001;
    mouseScreenPos: Vec2 = new Vec2();
    mousePos: Vec3 | undefined;
    mouseNormal: Vec3 | undefined;

    cameraOrbitSpeed: number = 1;
    keyboardMovementSpeed: number = 5;
    flySpeed: number = 5;

    curMode : Mode = Mode.NONE;
    curFace : Object | undefined;

    get terraformStrength(): number {
        return GetAppState().getState(TERRAFORM_STRENGTH_SLIDER) ?? 3;
    }

    movementDir: Vec3 = new Vec3();

    get camera() {
        return this.cameraModel.camera;
    }

    get model(): MainSceneModel {
        return this.owner.model as MainSceneModel;
    }

    setCursor(cursor: TerrainCursorModel) : void {
        this.cursor = cursor;
        this.updateCursorScale();
    }

    updateTerrainIntersection(ndc: Vec2) : void {
        const ndcVector = new THREE.Vector2(ndc.x, ndc.y);
        this.raycaster.setFromCamera(ndcVector, this.owner.getThreeJSCamera());

        const terrainView = this.owner.getViewListForModel(this.model.terrain)[0] as LowPolyTerrainView;
        if (!terrainView) return;

        if (this.curMode == Mode.FLATTEN && this.mouseNormal && this.mousePos) {
            let start = Vec3.FromThreeJS(this.raycaster.ray.origin);
            let line = Vec3.FromThreeJS(this.raycaster.ray.direction);
            let temp = this.mouseNormal.dot(line);
            if (Math.abs(temp) > 0.00001) {
                // Should always be the case, otherwise its parallel and thats bad
                let d = (this.mousePos.minus(start).dot(this.mouseNormal)) / temp;
                this.mousePos = start.plus(line.times(d));
                return;
            }
        }

        const intersects = this.raycaster.intersectObject(terrainView.meshGraphic.threejs, false);

        // Update stuff
        if (intersects.length > 0) {
            let hit = intersects[0];

            this.mousePos = Vec3.FromThreeJS(hit.point);
            let normal = hit.face?.normal;
            this.mouseNormal = (normal) ? Vec3.FromThreeJS(normal.clone()) : undefined;
        } else {
            this.mousePos = undefined;
            this.mouseNormal = undefined;
        }
    }

    constructor(owner?: ABasicSceneController,
        name?: string,
        interactionCallbacks?: HasInteractionModeCallbacks,
        ...args: any[]) {
        super(name, owner, interactionCallbacks, ...args);
        // this.reset();
    }

    reset() {
        this.playerCam.zRotation = 0;
        this.playerCam.yRotation = Math.PI * 3 / 2;
    }

    updateTerrainCursor(position: Vec3, direction: Vec3 | undefined) {
        if (this.cursor) {
            this.cursor.position = new Vec3(position.x, position.y, position.z + 0.05);
            this.cursor.visible = !this.model.screenshotMode;

            if (direction) {
                this.cursor.direction = direction;
            }
        }
    }

    /**
     * This gets called immediately before the interaction mode is activated. For now, we will call reset()
     * @param args
     */
    beforeActivate(...args: any[]) {
        super.beforeActivate(...args);
        this.playerCam = new PlayerCamera();
        this.reset();
    }

    /**
     * Create an instance in a single call, instead of calling new followed by init
     * @param owner
     * @param args
     * @returns {ASceneInteractionMode}
     * @constructor
     */
    static Create(owner: ABasicSceneController, ...args: any[]) {
        let controls = new this();
        controls.init(owner);
        return controls;
    }

    onWheelMove(event: AInteractionEvent, interaction: AWheelInteraction) {
        const wheelEvent = event.DOMEvent as WheelEvent;
        let zoom = wheelEvent.deltaY;

        wheelEvent.preventDefault();
        const delta = -zoom * this.cursorRadiusScrollSpeed;
        this.cursorRadius = Math.max(this.minCursorRadius, Math.min(this.maxCursorRadius, this.cursorRadius + delta));
        this.updateCursorScale();
    }

    updateCursorScale() {
        if (this.cursor) {
            (this.cursor.transform as NodeTransform3D).scale = this.cursorRadius;
        }
    }

    onMouseMove(event: AInteractionEvent, interaction: ADOMPointerMoveInteraction) {
        if (!event.ndcCursor) return;

        this.mouseScreenPos = event.ndcCursor;
    }

    updateMovement(interaction: AKeyboardInteraction) {
        this.movementDir._setToDefault();
        if (interaction.keysDownState['w']) {
            this.movementDir.addVector(this.playerCam.cameraDir);
        }
        if (interaction.keysDownState['a']) {
            this.movementDir.subtractVector(this.playerCam.cameraOrthDir);
        }
        if (interaction.keysDownState['s']) {
            this.movementDir.subtractVector(this.playerCam.cameraDir);

        }
        if (interaction.keysDownState['d']) {
            this.movementDir.addVector(this.playerCam.cameraOrthDir);
        }

        // Make sure diagonal movement is not faster than walking straight
        this.movementDir = this.movementDir.getNormalized().times(this.keyboardMovementSpeed);

        // Add vertical movement
        if (interaction.keysDownState[' ']) {
            this.movementDir.z += this.flySpeed;

        }
        if (interaction.keysDownState['Shift']) {
            this.movementDir.z -= this.flySpeed;
        }
    }

    updateMode(interaction: AKeyboardInteraction) {
        this.curMode = Mode.NONE;

        if (interaction.keysDownState['e']) {
            this.curMode = Mode.ADD;
        }
        if (interaction.keysDownState['q']) {
            if (this.curMode != Mode.NONE) {
                this.curMode = Mode.NONE;
                return;
            }
            this.curMode = Mode.REMOVE;
        }
        if (interaction.keysDownState['f']) {
            if (this.curMode != Mode.NONE) {
                this.curMode = Mode.NONE;
                return;
            }
            this.curMode = Mode.FLATTEN;
        }
    }

    onKeyDown(event: AInteractionEvent, interaction: AKeyboardInteraction) {
        this.updateMovement(interaction);
        this.updateMode(interaction);
    }

    onKeyUp(event: AInteractionEvent, interaction: AKeyboardInteraction) {
        this.updateMovement(interaction);
        this.updateMode(interaction);
    }

    onDragStart(event: AInteractionEvent, interaction: ADragInteraction): void {
        /**
         * Here we will track some interaction state. Specifically, the last cursor position.
         */
        interaction.setInteractionState('lastCursor', event.ndcCursor);
    }
    onDragMove(event: AInteractionEvent, interaction: ADragInteraction): void {
        if (!event.ndcCursor) {
            return;
        }
        let mouseMovement = event.ndcCursor.minus(interaction.getInteractionState('lastCursor'));
        interaction.setInteractionState('lastCursor', event.ndcCursor);
        let rotationX = -mouseMovement.x * this.cameraOrbitSpeed;
        let rotationY = mouseMovement.y * this.cameraOrbitSpeed;
        this.playerCam.yRotation -= rotationY;
        this.playerCam.zRotation += rotationX;
    }
    onDragEnd(event: AInteractionEvent, interaction: ADragInteraction): void {
        let cursorWorldCoordinates: Vec2 | null = event.ndcCursor;
        let dragStartWorldCoordinates: Vec2 | null = interaction.dragStartEvent.ndcCursor;
    }

    /**
     * This would be a good place to implement the time update of any movement filters
     * @param t
     * @param args
     */
    lastT: number = 0;
    timeUpdate(t: number, ...args: any[]) {
        let delta = t - this.lastT;
        this.lastT = t;

        this.player.position.addVector(this.movementDir.times(delta));

        const terrainHeight = this.model.terrain.getHeightAt(
            this.player.position.x,
            this.player.position.y
        );
        const minZ = terrainHeight + this.player.radius;
        if (this.player.position.z < minZ) {
            this.player.position.z = minZ;
        }

        this.playerCam.updateCamera(this.camera, this.player);

        // Update mouse position
        this.updateTerrainIntersection(this.mouseScreenPos);

        if (this.mousePos) {
            this.updateTerrainCursor(this.mousePos, this.mouseNormal);

            let color = this.model.terrain.getColorAt(this.mousePos.x, this.mousePos.y);
            switch (this.curMode) {
                case Mode.ADD:
                    this.model.terrain.terraform(this.mousePos, this.cursorRadius, this.terraformStrength * delta);
                    this.model.particles.emitTerraformParticle(Mode.ADD, this.mousePos, color, t);
                    break;
                case Mode.REMOVE:
                    this.model.terrain.terraform(this.mousePos, this.cursorRadius, -this.terraformStrength * delta);
                    this.model.particles.emitTerraformParticle(Mode.REMOVE, this.mousePos, color, t);
                    break;
                case Mode.FLATTEN:
                    this.model.terrain.flatten(this.mousePos, this.cursorRadius, this.mouseNormal, 5 * this.terraformStrength * delta);
                    break;
                default:
                    break;
            }
        } else if (this.cursor) {
            this.cursor.visible = false;
        }
    }

}
