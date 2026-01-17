/**
 * @file Main scene model
 * @description Main model for your application
 */

import {
    AppState,
    GetAppState,
    NodeTransform3D,
    V3,
} from "../../anigraph";
import { ABasicSceneModel } from "../../anigraph/starter";
import { AssetManager } from "../../anigraph";
import { LowPolyTerrainModel } from "./Nodes/LowPolyTerrain";
import { BallPlayerModel } from "./Nodes/BallPlayer";
import { CharacterModel } from "../../anigraph/starter/nodes/character";
import { GroundParticleSystemModel } from "./Nodes/ParticleSystem";
import { TerrainCursorModel } from "./Nodes/TerrainCursor";

const HILL_HEIGHT_SLIDER = "HillHeight";
const HILL_SCALE_SLIDER = "HillScale";
export const TERRAFORM_STRENGTH_SLIDER = "Strength";

/**
 * This is your Main Model class. The scene model is the main data model for your application. It is the root for a
 * hierarchy of models that make up your scene/
 */
export class MainSceneModel extends ABasicSceneModel {
    terrain!: LowPolyTerrainModel;

    player!: BallPlayerModel;
    particles!: GroundParticleSystemModel;

    cursor!: TerrainCursorModel;

    noiseScale: number = 0.15;
    hillAmplitude: number = 0.5;
    screenshotMode: boolean = false;

    async PreloadAssets(): Promise<void> {
        await super.PreloadAssets();

        await CharacterModel.LoadShaderModel();
        await GroundParticleSystemModel.LoadShaderModel();
        await AssetManager.loadTexture("./images/tanktexburngreen.jpeg", "tank");
        await AssetManager.loadTexture("./images/gradientParticle.png", "particle")
    }

    initAppState(appState: AppState) {
        appState.addSliderIfMissing(HILL_HEIGHT_SLIDER, 0.5, 0, 1.5, 0.01);
        appState.addSliderIfMissing(HILL_SCALE_SLIDER, 0.15, 0.05, 0.5, 0.01);
    }

    initCamera(...args: any[]) {
        this.initPerspectiveCameraFOV(Math.PI / 2, 1.0);

        this.camera.setPose(NodeTransform3D.LookAt(
            V3(0, -3, 2),
            V3(0, 0, 0),
            V3(0, 0, 1)
        ));
    }

    regenerateHills() {
        this.terrain.generateHills(this.noiseScale, this.hillAmplitude);
    }

    initTerrain() {
        const terrainWidth = 40.0;
        const terrainHeight = 40.0;
        const segments = 80;

        this.terrain = LowPolyTerrainModel.Create(
            terrainWidth,
            terrainHeight,
            segments,
            segments
        );

        this.regenerateHills();

        this.addNode(this.terrain);

        this.subscribeToAppState(HILL_HEIGHT_SLIDER, (value: number) => {
            this.hillAmplitude = value;
        });

        this.subscribeToAppState(HILL_SCALE_SLIDER, (value: number) => {
            this.noiseScale = value;
        });

        const appState = GetAppState();
        appState.addButton("Apply Hills (Resets Terrain)", () => {
            this.regenerateHills();
        });

        appState.addButton("Reset Terrain (Flat)", () => {
            this.terrain.initHeights();
            this.terrain.generateGeometry();
        });

        appState.addSliderIfMissing(TERRAFORM_STRENGTH_SLIDER, 3, 0.5, 10, 0.1);
    }

    initPlayer() {
        const playerTexture = AssetManager.getTexture("tank");

        this.player = BallPlayerModel.Create(playerTexture, 0.3);

        this.player.position.setElements([0, 0, this.player.radius + 0.1]);

        this.addNode(this.player);
    }

    initParticles() {
        this.particles = GroundParticleSystemModel.Create(this.player, 50, AssetManager.getTexture("particle"));
        this.addNode(this.particles)
    }

    initScene() {
        this.addViewLight();

        this.initTerrain();

        this.initPlayer();

        this.initParticles();

        this.cursor = new TerrainCursorModel();
        this.addNode(this.cursor);

        const appState = GetAppState();
        appState.addButton("Toggle Screenshot Mode", () => {
            this.screenshotMode = !this.screenshotMode;
            this.player.visible = !this.screenshotMode;
            this.particles.visible = !this.screenshotMode;
            this.cursor.visible = !this.screenshotMode;
        });
    }

    timeUpdate(t?: number): void;
    timeUpdate(...args: any[]) {
        let t = this.clock.time;
        this.particles.timeUpdate(t);
        if (args != undefined && args.length > 0) {
            t = args[0];
        }
    }
}
