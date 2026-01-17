import {ACamera, NodeTransform3D, Quaternion, Vec3} from "../../../../anigraph";
import {PlayerInterface} from "../../InteractionModes";

export class PlayerCamera {

    cameraDir:Vec3 = new Vec3();
    cameraOrthDir:Vec3 = new Vec3();

    _zRotation:number = 0;
    _yRotation:number = Math.PI*3/2;
    _playerDist:number = 3;

    yMax:number = 3.1;
    yMin:number = 0.1;

    set zRotation(zRotation:number){
        this._zRotation = zRotation;
    }
    get zRotation(){
        return this._zRotation;
    }

    set yRotation(yRotation:number){
        this._yRotation = yRotation;
        if (this._yRotation < this.yMin) {
            this._yRotation = this.yMin;
        }
        if (this._yRotation > this.yMax) {
            this._yRotation = this.yMax;
        }
    }
    get yRotation(){
        return this._yRotation;
    }

    set playerDist(playerDist:number){
        this._playerDist = playerDist;
    }
    get playerDist(){
        return this._playerDist;
    }

    updateCamera(camera:ACamera, player:PlayerInterface) {
        let qZ = Quaternion.FromAxisAngle(Vec3.UnitZ(), this._zRotation);
        let qY = Quaternion.FromAxisAngle(Vec3.UnitY(), this._yRotation);
        let cameraVec = new Vec3(0, 0, -this._playerDist);
        cameraVec = qY.appliedTo(cameraVec);
        cameraVec = qZ.appliedTo(cameraVec);
        camera.setPose(NodeTransform3D.LookAt(player.position.plus(cameraVec), player.position, Vec3.UnitZ()));

        this.cameraDir.setElements([camera.forward.x, camera.forward.y, 0]);
        this.cameraOrthDir.setElements([camera.forward.y, -camera.forward.x, 0]);
    }
}