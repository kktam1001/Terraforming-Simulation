import {ANodeModel3D} from "../../../scene";
import {AObjectState, ASerializable} from "../../../base";
import {VertexArray3D} from "../../../geometry";
import type {Transformation3DInterface} from "../../../math";
import {ALineMaterialModel} from "../../../rendering";
import {AssetManager} from "../../../fileio";


@ASerializable("CoordinateAxesModel")
export class CoordinateAxesModel extends ANodeModel3D{
    @AObjectState axesScale:number;
    @AObjectState lineWidth!:number;

    constructor(scale:number=1,...args:any[]) {
        super();
        this.lineWidth = 0.002;
        this.axesScale = scale;
        this.axesScale=scale;
        this.setMaterial(AssetManager.CreateShaderMaterial(AssetManager.DEFAULT_MATERIALS.LineMaterial));
    }

    getStrokeMaterial() {
        return ALineMaterialModel.GlobalInstance.CreateMaterial();
    }

}


