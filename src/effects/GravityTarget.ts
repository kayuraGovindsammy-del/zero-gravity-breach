import * as THREE from 'three';
export type GravityHit={point:THREE.Vector3;normal:THREE.Vector3;label:string};
export class GravityTarget {
 public group=new THREE.Group();private raycaster=new THREE.Raycaster();private marker:THREE.Mesh;
 private targets:THREE.Mesh[]=[];private currentHit:GravityHit|null=null;
 constructor(environment:THREE.Group){
  environment.updateWorldMatrix(true,true);
  environment.traverse(o=>{if(o instanceof THREE.Mesh&&o.userData.gravitySurface===true)this.targets.push(o);});
  const mat=new THREE.MeshBasicMaterial({color:0x00e5ff,side:THREE.DoubleSide,transparent:true,opacity:.85,depthWrite:false,depthTest:false});
  this.marker=new THREE.Mesh(new THREE.RingGeometry(.28,.34,40),mat);this.marker.visible=false;this.marker.renderOrder=100;this.group.add(this.marker);
  this.raycaster.far=40;
 }
 update(camera:THREE.Camera){
  this.raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
  const hits=this.raycaster.intersectObjects(this.targets,false);
  if(!hits.length||!hits[0].face){this.currentHit=null;this.marker.visible=false;return;}
  const hit=hits[0];
  const normal=hit.face!.normal.clone().transformDirection(hit.object.matrixWorld).normalize();
  // Geometry box normals point outward; for interior targeting, use the side facing the camera.
  const ray=this.raycaster.ray.direction;
  if(normal.dot(ray)>0)normal.negate();
  const axis=new THREE.Vector3();const abs=[Math.abs(normal.x),Math.abs(normal.y),Math.abs(normal.z)];const k=abs.indexOf(Math.max(...abs));
  axis.setComponent(k,Math.sign(normal.getComponent(k)));
  this.currentHit={point:hit.point.clone(),normal:axis,label:hit.object.userData.gravityLabel||'SURFACE'};
  this.marker.visible=true;this.marker.position.copy(hit.point).addScaledVector(axis,.06);
  this.marker.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),axis);
 }
 getHit(){return this.currentHit;}
}
