import { LowPolyTerrainModel } from "./LowPolyTerrainModel";
import {
    ANodeView,
    ANodeModel,
    ATriangleMeshGraphic
} from "../../../../anigraph";
import * as THREE from "three";

export class LowPolyTerrainView extends ANodeView {
    meshGraphic!: ATriangleMeshGraphic;
    wireframe!: THREE.LineSegments;

    get model(): LowPolyTerrainModel {
        return this._model as LowPolyTerrainModel;
    }

    static Create(model: ANodeModel) {
        let view = new this();
        view.setModel(model);
        return view;
    }

    init() {
        const material = new THREE.MeshBasicMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
        });

        this.meshGraphic = new ATriangleMeshGraphic(this.model.verts, material);
        this.registerAndAddGraphic(this.meshGraphic);

        const edgeGeometry = new THREE.WireframeGeometry(this.meshGraphic.geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x1a1a2e,
            linewidth: 2
        });
        this.wireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        this.threejs.add(this.wireframe);

        this.setTransform(this.model.transform);
    }

    update(): void {
        this.meshGraphic.setVerts(this.model.verts);

        if (this.wireframe) {
            this.threejs.remove(this.wireframe);
        }
        const edgeGeometry = new THREE.WireframeGeometry(this.meshGraphic.geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x1a1a2e,
            linewidth: 2
        });
        this.wireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        this.threejs.add(this.wireframe);

        this.setTransform(this.model.transform);
    }
}

