import {ANodeModel, ANodeView} from "../../../scene";
import {ALineGraphic, ALineMaterialModel, ALineSegmentsGraphic, ATriangleMeshGraphic} from "../../../rendering";
import {CoordinateAxesModel} from "./CoordinateAxesModel";
import {ACoordinateAxesGraphic} from "../../../rendering/graphicelements/ACoordinateAxesGraphic";
import {Color, Mat4, V3, Vec2} from "../../../math";
import {VertexArray2D, VertexArray3D} from "../../../geometry";


function createVertexArray(scale:number){
    let verts = VertexArray3D.CreateForRendering(true, false, false);
    let o = V3();
    let x = V3(scale,0,0);
    let y = V3(0,scale,0);
    let z = V3(0,0,scale);
    let r=Color.Red();
    let g = Color.Green();
    let b = Color.Blue();
    verts.addVertices(
        [o,x,o,y,o,z],
        [r,r,g,g,b,b]
    )
    return verts
}

function getvs(scale:number=1){
    let verts = new VertexArray2D();
    for(let i=0;i<5;i++){
        verts.addVertex(Vec2.Random([-0.5,0.5]).times(scale), Color.Random());
    }
    return verts;
}

export class CoordinateAxesView extends ANodeView{
    coordinateAxesGraphic!: ACoordinateAxesGraphic

    get model():CoordinateAxesModel{
        return this._model as CoordinateAxesModel;
    }

    static Create(model:ANodeModel, ...args:any[]){
        let view = new this();
        view.setModel(model);
        return view;
    }

    init(){
        this.coordinateAxesGraphic = new ACoordinateAxesGraphic();
        this.registerAndAddGraphic(this.coordinateAxesGraphic);
        this.update();
    }

    update(): void {
        this.setTransform(Mat4.Scale3D(this.model.axesScale));
        this.coordinateAxesGraphic.setLineWidth(this.model.lineWidth);
    }
}
