import * as THREE from 'three';
export class ReactorAssembly {
 group=new THREE.Group();private rings:THREE.Mesh[]=[];private core:THREE.MeshStandardMaterial;private light:THREE.PointLight;private time=0;
 constructor(){
  this.group.position.set(0,0,1);
  const metal=new THREE.MeshStandardMaterial({color:0x364e60,metalness:.85,roughness:.35});
  this.core=new THREE.MeshStandardMaterial({color:0x0a789b,emissive:0x04b8e9,emissiveIntensity:2.1,metalness:.35,roughness:.22});
  const cylinder=(r:number,h:number,y:number,mat:THREE.Material)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,32),mat);m.position.y=y;m.castShadow=true;m.userData.solid=true;this.group.add(m);return m;};
  cylinder(3,.65,.35,metal);cylinder(3,.65,10.7,metal);
  cylinder(1.25,9,5.5,this.core);
  for(const y of [2,4,6,8,10]){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.3,.25,12,64),metal);ring.rotation.x=Math.PI/2;ring.position.y=y;this.group.add(ring);this.rings.push(ring);}
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4,x=Math.cos(a)*2.75,z=Math.sin(a)*2.75;
   const beam=cylinder(.22,10.3,5.5,metal);beam.position.x=x;beam.position.z=z;
  }
  this.light=new THREE.PointLight(0x00c9ff,130,20);this.light.position.set(0,6,0);this.group.add(this.light);
 }
 update(dt:number){this.time+=dt;this.light.intensity=120+20*Math.sin(this.time*2);this.core.emissiveIntensity=1.9+.35*Math.sin(this.time*2);this.rings.forEach((r,i)=>r.rotation.z=this.time*(i%2?-.08:.08));}
}
