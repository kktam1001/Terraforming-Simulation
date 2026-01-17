import { GroundParticleSystemModel } from "./GroundParticleSystemModel";
import { Color, Mat4, NodeTransform3D, Quaternion, GetAppState } from "../../../../anigraph";
import { AInstancedParticleSystemView } from "../../../../anigraph/effects";
import { GroundParticleSystemGraphic } from "./GroundParticleSystemGraphic";
import { GroundParticle } from "./GroundParticle";

export class GroundParticleSystemView extends AInstancedParticleSystemView<GroundParticle> {
    static MAX_PARTICLES = 300;

    get particlesElement(): GroundParticleSystemGraphic {
        return this._particlesElement as GroundParticleSystemGraphic;
    }
    get model(): GroundParticleSystemModel {
        return this._model as GroundParticleSystemModel;
    }

    createParticlesElement(...args: any[]): GroundParticleSystemGraphic {
        return GroundParticleSystemGraphic.Create(GroundParticleSystemView.MAX_PARTICLES,
            this.mainMaterial);
    }

    init() {
        super.init();
    }

    getCameraRotation(): Quaternion {
        const appState = GetAppState();
        const camera = appState.sceneModel.camera;
        return camera.pose._getQuaternionRotation();
    }

    updateParticles(...args: any[]) {
        const cameraRotation = this.getCameraRotation();

        for (let i = 0; i < this.model.particles.length; i++) {
            if (!this.model.particles[i].visible) {
                this.particlesElement.setMatrixAt(i, Mat4.Zeros());
            } else {
                this.particlesElement.setColorAt(i, this._getColorForParticleIndex(i));
                this.particlesElement.setMatrixAt(i, this._getTransformForParticleIndex(i, cameraRotation));
            }
        }
        this.particlesElement.setNeedsUpdate();
        this.update([]);
    }

    _getColorForParticleIndex(i: number): Color {
        return this.model.particles[i].color;
    }

    /**
     * This function should return the transformation to be applied to geometry associated with the provided particle
     * @param particle
     */
    _getTransformForParticleIndex(i: number, cameraRotation?: Quaternion): Mat4 {
        const particle = this.model.particles[i];
        const rotation = cameraRotation ?? new Quaternion();

        const nodeTransform = new NodeTransform3D(particle.position, rotation, particle.size);
        return nodeTransform.getMat4();
    }

    update(args: any): void {
    }
}
