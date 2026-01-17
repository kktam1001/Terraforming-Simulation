import { TransformationInterface, Vec3 } from "../../../anigraph";

export interface PlayerInterface {
    get transform(): TransformationInterface;
    position: Vec3;
    radius: number;
}
