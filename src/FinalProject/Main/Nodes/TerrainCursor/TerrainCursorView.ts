import { TerrainCursorModel } from "./TerrainCursorModel";
import { ANodeModel, ANodeView, ATriangleMeshGraphic } from "../../../../anigraph";
import * as THREE from "three";

export class TerrainCursorView extends ANodeView{
    circleGraphic!:ATriangleMeshGraphic;

    /**
     * Redefine the model getter to return a model with our custom model class
     * @returns {ATriangleMeshModel}
     */
    get model():TerrainCursorModel{
        return this._model as TerrainCursorModel;
    }

    /**
     * Creates a new instance for a given model
     * @param model
     * @param args
     * @returns {TerrainCursorView}
     * @constructor
     */
    static Create(model:ANodeModel, ...args:any[]){
        let view = new this();
        view.setModel(model);
        return view;
    }

    /**
     * Initializer that gets called once the model has been set
     */
    init(){
        const material = new THREE.MeshBasicMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
        });
        material.depthTest = false;

        this.circleGraphic = new ATriangleMeshGraphic(this.model.circle, material);
        this.registerAndAddGraphic(this.circleGraphic);
    }

    /**
     * Update that gets called whenever AObjectState for the model changes
     */
    update(): void {
        this.circleGraphic.setVerts(this.model.circle);
        this.setTransform(this.model.transform);
        this.circleGraphic.visible = this.model.visible;
    }
}


