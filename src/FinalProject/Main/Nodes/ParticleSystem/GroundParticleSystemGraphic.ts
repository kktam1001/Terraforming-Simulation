import { AInstancedParticleSystemGraphic } from "../../../../anigraph/effects";
import { AMaterial, VertexArray3D, V3, V2, Color } from "../../../../anigraph";
import * as THREE from "three";

/**
 * Optionally, you can customize the graphic class used for the particle system.
 */
export class GroundParticleSystemGraphic extends AInstancedParticleSystemGraphic {

    static CreateTriangles(scale: number = 1): VertexArray3D {
        let verts = VertexArray3D.CreateForRendering(true, true, true);
        const height = scale * Math.sqrt(3) / 2;
        const halfBase = scale / 2;

        const v0 = V3(0, height * 2 / 3, 0);
        const v1 = V3(-halfBase, -height / 3, 0);
        const v2 = V3(halfBase, -height / 3, 0);

        const normal = V3(0, 0, 1);
        const color = Color.White();

        verts.addVertex(v0, normal, V2(0.5, 1), color);
        verts.addVertex(v1, normal, V2(0, 0), color);
        verts.addVertex(v2, normal, V2(1, 0), color);
        verts.addTriangleIndices(0, 1, 2);

        return verts;
    }

    init(nParticles?: number, material?: AMaterial | THREE.Material, geometry?: VertexArray3D, ...args: any[]) {
        const triangleGeometry = GroundParticleSystemGraphic.CreateTriangles(1);
        super.init(nParticles, material, triangleGeometry, ...args);
    }
}
